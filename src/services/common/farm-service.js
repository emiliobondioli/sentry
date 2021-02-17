import axios from "axios";
import { parseAddress, convertValue } from "@/utils";

const API_BASE = "https://api.bscscan.com/api";
const API_TOKEN = "TF9Q3E4IQ4MVN5WPDHE2J6RXUQUAH97E88";

export default class FarmService {
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
  init() {
    return Promise.all([this.createPools(), this.initContract()]);
  }

  /**
   * Get contract abi and return a web3 Contract instance
   */
  initContract() {
    const contractAddress = this.config.address;
    return this.get(API_BASE, {
      address: contractAddress,
      module: "contract",
      action: "getabi",
      apikey: API_TOKEN,
    }).then((r) => {
      let abi;
      try {
        abi = JSON.parse(r.data.result);
      } catch {
        throw new Error("Contract ABI not readable");
      }
      if (abi) {
        this.contract = new this.web3.eth.Contract(abi, contractAddress);
        console.log(this.contract.methods);
        return this.contract;
      }
    });
  }

  /**
   * Initialize pools for the current farm
   */
  createPools() {
    return this.get(this.config.url).then((r) => {
      const pools = this.config.value(r);
      this.pools = pools.map(this.createPool.bind(this));
      console.log(this.pools);
    });
  }

  /**
   *
   * @param {pool} pool
   */
  createPool(pool) {
    const data = {
      name: this.config.name,
      url: this.config.url,
      address: this.config.address,
    };
    for (const k in this.config.keys) {
      if (typeof this.config.keys[k] === "function") {
        data[k] = this.config.keys[k](pool);
      } else {
        data[k] = pool[this.config.keys[k]];
      }
    }
    data.pool = pool;
    return data;
  }

  /**
   *
   * @param {address} userAddress
   */
  scan(userAddress) {
    if (!userAddress && !this.userAddress)
      throw new Error("userAddress is required");
    this.userAddress = userAddress;
    return this.getTransactions(this.userAddress).then((transactions) => {
      console.log(
        `${transactions.length} transactions found for address ${this.userAddress}`
      );
      const userPools = [];
      this.pools.forEach((p) => {
        const poolTransactions = transactions.filter((t) =>
          this.isPoolTransaction(t, p)
        );
        if (!poolTransactions.length) return;
        const pool = {
          ...p,
          transactions: poolTransactions.map(this.prepareTransaction),
          userAddress: this.userAddress,
        };
        userPools.push(pool);
      });
      return this.getUserStats(userPools, this.userAddress);
    });
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
   *
   * @param {pool} pool
   * @param {address} userAddress
   */
  // eslint-disable-next-line no-unused-vars
  getUserStatsForPool(pool, userAddress) {
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
    return Promise.all(promises).then(console.log);
  }

  /**
   * Gets total deposited tokens in pool for userAddress
   * @param {pool} pool
   */
  computePoolBalance(pool, userAddress) {
    return pool.transactions
      .map((t) => (t.from === this.userAddress ? t.value : t.value * -1))
      .reduce((a, b) => a + b, 0);
  }

  /**
   *
   * @param {address} address
   * @param {address} contractAddress
   */
  getTransactions(address, contractAddress = null) {
    const params = {
      address,
      module: "account",
      action: "tokentx",
      apikey: API_TOKEN,
    };
    if (contractAddress) params.contractaddress = parseAddress(contractAddress);
    return this.get(API_BASE, params).then((r) => {
      return r.data.result;
    });
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

/**
 * Add multiple pool stats to pool object
 * @param {pool} pool
 * @param {array} stats
 */
export function setPoolStats(pool, stats) {
  let p = { ...pool };
  stats.forEach((s) => (p = { ...p, ...s }));
  return p;
}

/**
 * Allows the use of multiple sets of promises for each pool,
 */
export class BatchRequest {
  constructor() {
    this.promises = [];
    this.calls = [];
    this.modifier = null;
  }

  /**
   * Adds a contract method and modifier to the batch
   * @param {function} method contract method to be called
   * @param {function} modifier function to modify the returned value before resolving
   */
  add(method, modifier = (r) => r) {
    this.promises.push(
      new Promise((resolve, reject) => {
        this.calls.push({
          method,
          result: (e, r) => {
            if (e) reject(e);
            else resolve(modifier(r));
          },
        });
      })
    );
  }

  /**
   * Adds all batch calls to the provided request
   * @param {w3.BatchRequest} request
   */
  addToRequest(request) {
    this.calls.forEach((c) => {
      request.add(c.method.call.request(c.result));
    });
    return this.all();
  }

  /**
   * Returns a Promise resolved once all calls are done
   */
  all() {
    return Promise.all(this.promises).then((r) => {
      if (this.modifier) return this.modifier(r);
      return r;
    });
  }
}
