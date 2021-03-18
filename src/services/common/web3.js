import Web3 from "web3";
import axios from "axios";
import { ref } from "vue";

export const endpoints = [
  "https://bsc-dataseed1.binance.org/",
  "https://bsc-dataseed2.binance.org/",
  "https://bsc-dataseed3.binance.org/",
  "https://bsc-dataseed4.binance.org/",
  "https://bsc-dataseed1.defibit.io/",
  "https://bsc-dataseed2.defibit.io/",
  "https://bsc-dataseed3.defibit.io/",
  "https://bsc-dataseed4.defibit.io/",
  "https://bsc-dataseed1.ninicoin.io/",
  "https://bsc-dataseed2.ninicoin.io/",
  "https://bsc-dataseed3.ninicoin.io/",
  "https://bsc-dataseed4.ninicoin.io/",
];

class Web3Provider {
  constructor() {
    this.endpoint = "";
    this.initialized = false;
    this.connectedAddress = ref("");
  }

  checkEndpoints(endpoints) {
    const promises = [];
    endpoints.forEach((endpoint) => {
      promises.push(axios.get(endpoint).then(() => endpoint));
    });
    return Promise.any(promises);
  }

  setProvider(provider) {
    this.provider = provider;
    this.connectedAddress.value = provider.givenProvider.selectedAddress;
  }

  async init() {
    if (this.initialized) return this.provider;
    if (this.status instanceof Promise) return this.status;
    this.status = this.checkEndpoints(endpoints).then((endpoint) => {
      this.endpoint = endpoint;
      this.initialized = true;
      this.setProvider(new Web3(new Web3.providers.HttpProvider(endpoint)));
    });
    return this.status;
  }
}

export default new Web3Provider();
