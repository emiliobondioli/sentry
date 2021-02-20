import axios from "axios";
import { parseAddress, convertValue } from "@/utils";
import { LPService } from "./lp-service";

const API_BASE = "https://api.bscscan.com/api";
const API_TOKEN = "TF9Q3E4IQ4MVN5WPDHE2J6RXUQUAH97E88";

export class FarmService {
  /**
   *
   * @param {object} config
   * @param {web3} web3
   */
  constructor(config, web3) {
    this.config = config;
    this.pools = [];
    this.userAddress = "";
    this.web3 = web3;
    this.initialized = false;
    this.id = config.id;
  }

  /**
   * Sets the address for current user
   * @param {address} value
   */
  setUserAddress(address) {
    this.userAddress = parseAddress(address);
  }

  /**
   *  Init farm pools and contract
   */
  async init() {
    await Promise.all([this.createPools(), this.initContract()]);
    return (this.initialized = true);
  }

  /**
   * Get contract abi and return a web3 Contract instance
   */
  async initContract() {
    const contractAddress = this.config.address;
    const r = await this.get(API_BASE, {
      address: contractAddress,
      module: "contract",
      action: "getabi",
      apikey: API_TOKEN,
    });
    let abi;
    try {
      abi = JSON.parse(r.data.result);
    } catch {
      throw new Error("Contract ABI not readable");
    }
    if (abi) {
      this.contract = new this.web3.eth.Contract(abi, contractAddress);
      return this.contract;
    }
  }

  /**
   * Abstract function to parse the API response and create the pools array for the current farm
   * @abstract
   */
  parsePools(_r) {
    throw new Error("parsePools should be implemented for each farm service");
  }

  /**
   * Initialize pools for the current farm
   */
  async createPools() {
    const r = await this.get(this.config.url);
    this.pools = this.parsePools(r, this.config);
  }

  /**
   *
   * @param {address} userAddress
   */
  async scan(userAddress) {
    if (!userAddress && !this.userAddress)
      throw new Error("userAddress is required");
    if (!this.initialized) await this.init();
    this.userAddress = userAddress;
    const transactions = await this.getTransactions(this.userAddress);
    console.log(transactions);
    const rewardTransactions = transactions.filter((t) => {
      t.contractAddress === this.config.address;
    });
    console.log(rewardTransactions);

    const userPools = [];
    this.pools.forEach((p) => {
      const poolTransactions = transactions.filter((t) =>
        this.isPoolTransaction(t, p)
      );
      if (!poolTransactions.length) return;
      const pool = {
        ...p,
        transactions: poolTransactions.map(this.prepareTransaction.bind(this)),
        userAddress: this.userAddress,
      };
      pool.depositedTokens = this.computePoolDepositedTokens(pool);

      if (pool.depositedTokens > 0) {
        userPools.push(pool);
      }
    });
    let pools = await Promise.all(
      userPools.map(async (pool) => {
        if (pool.lp) {
          return await this.getLPInfo(pool);
        }
        return pool;
      })
    );
    pools = await this.getUserStats(pools, this.userAddress);
    return { ...this.config, pools };
  }

  /**
   *
   * @param {transaction} t
   */
  prepareTransaction(t) {
    return {
      ...t,
      date: new Date(t.timeStamp * 1000),
      value: convertValue(t.value),
    };
  }

  /**
   * Abstract function call the farm's contract methods and get the current user stats
   * @param {pool} pool
   * @param {address} userAddress
   */
  getUserStatsForPool() {
    throw new Error(
      "getUserStatsForPool should be implemented for each farm service"
    );
  }

  /**
   *
   * @param {array} poos
   * @param {address} userAddress
   */
  getUserStats(pools, userAddress) {
    const request = new this.web3.BatchRequest();
    const promises = [];
    pools.forEach((p) => {
      const batch = this.getUserStatsForPool(p, userAddress);
      promises.push(batch.addToRequest(request));
    });
    request.execute();
    return Promise.all(promises).then((pools) => {
      return pools.map((pool) => {
        if (pool.lp) return this.computePoolCurrentLPTokens(pool);
        return pool;
      });
    });
  }

  /**
   * Gets total deposited tokens in pool for userAddress
   * @param {pool} pool
   */
  computePoolDepositedTokens(pool) {
    return pool.transactions
      .map((t) => (t.to === pool.address ? t.value : t.value * -1))
      .reduce((a, b) => a + b, 0);
  }

  /**
   * Gets single token amounts for LP pools
   * @param {pool} pool
   */
  computePoolCurrentLPTokens(pool) {
    const currentToken0 =
      (pool.currentTokens / convertValue(pool.info.farmWantLockedTotal)) *
      convertValue(pool.info.reserve0);
    const currentToken1 =
      (pool.currentTokens / convertValue(pool.info.farmWantLockedTotal)) *
      convertValue(pool.info.reserve1);
    return {
      ...pool,
      currentSingleTokens: {
        token0Amount: currentToken0,
        token1Amount: currentToken1,
      },
    };
  }

  /**
   * Add multiple pool stats to pool object
   * @param {pool} pool
   * @param {array} stats
   */
  setPoolStats(pool, stats) {
    let p = { ...pool };
    stats.forEach((s) => (p = { ...p, ...s }));
    return p;
  }

  /**
   *
   * @param {address} address
   * @param {address} contractAddress
   */
  async getTransactions(address, contractAddress = null) {
    const params = {
      address,
      module: "account",
      action: "tokentx",
      apikey: API_TOKEN,
    };
    if (contractAddress) params.contractaddress = parseAddress(contractAddress);
    const r = await this.get(API_BASE, params);
    return r.data.result;
  }

  /**
   * Gets info about the lp token pair
   * @param {pool} pool
   */
  async getLPInfo(pool) {
    const service = new LPService(pool.wantAddress, this.web3);
    const deposits = pool.transactions.filter(
      (t) => t.to === this.config.address
    );
    const stats = await service.getTokenStats(deposits);
    pool.transactions = pool.transactions.map((t) => {
      if (stats[t.hash]) {
        t.reservesAtBlock = stats[t.hash];
        delete stats[t.hash];
      }
      return t;
    });
    pool.info = { ...pool.info, ...stats };
    return pool;
  }

  /**
   *
   * @param {transaction} transaction
   * @param {pool} pool
   */
  isPoolTransaction(transaction, pool) {
    const isPoolAddress = [transaction.to, transaction.from].includes(
      this.config.address
    );
    const isPoolToken = transaction.contractAddress === pool.wantAddress;
    return isPoolAddress && isPoolToken;
  }

  /**
   *
   * @param {string} url
   * @param {object} params
   */
  get(url, params) {
    return axios.get(url, { params });
  }
}
