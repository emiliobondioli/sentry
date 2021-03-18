import axios from "axios";
import { parseAddress, convertValue } from "@/utils";
import { BatchRequest } from "./utils";

const API_BASE = "https://api.bscscan.com/api";
const API_TOKEN = "TF9Q3E4IQ4MVN5WPDHE2J6RXUQUAH97E88";

export class LPService {
  /**
   *
   * @param {address} address
   * @param {web3} web3
   */
  constructor(address, web3) {
    this.address = address;
    this.web3 = web3;
    this.initialized = false;
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
    await Promise.all([this.web3.init(), this.initContract()]);
    return (this.initialized = true);
  }

  /**
   * Get contract abi and return a web3 Contract instance
   */
  async initContract() {
    const contractAddress = this.address;
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
      this.contract = new this.web3.provider.eth.Contract(abi, contractAddress);
      return this.contract;
    }
  }

  /**
   * Gets current stats for contract tokens
   */
  async getTokenStats(deposits) {
    if (!this.initialized) await this.init();
    const request = new this.web3.provider.BatchRequest();
    const batch = new BatchRequest();

    /** Token reserves */
    if (this.contract.methods.getReserves) {
      batch.add(this.contract.methods.getReserves(), (r) => ({
        reserve0: convertValue(r[0]),
        reserve1: convertValue(r[1]),
      }));

      /** 
       * 
       * Disabled because of missing trie node error
       * 
      deposits.forEach((d) => {
        batch.add(
          this.contract.methods.getReserves(),
          (r) => {
            const o = {};
            o[d.hash] = {
              reserve0: convertValue(r[0]),
              reserve1: convertValue(r[1]),
            };
            return o;
          }
        );
      });
       */
    }

    batch.addToRequest(request);

    request.execute();
    return batch.all().then((r) => {
      return r.reduce((acc, value) => ({ ...acc, ...value }));
    });
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
