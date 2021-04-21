import axios from "axios";
import { parseAddress, convertValue, isSameAddress } from "@/utils";
import web3 from "./web3";

const API_BASE = "https://api.bscscan.com/api";
const API_TOKEN = "HA3WN9FN5JAEY2SW4REEWY8AZVJFPGQK4Y";

export class BSCService {
  /**
   *
   * @param {object} config
   * @param {web3} web3
   */
  constructor(config) {
    this.config = config;
    this.userAddress = "";
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
    await Promise.all([this.web3.init()]);
    return (this.initialized = true);
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
    if (r.data.status === "0") throw new Error(r.data.result);
    if (Array.isArray(r.data.result)) return r.data.result;
    return [];
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
