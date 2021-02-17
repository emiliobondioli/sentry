import Web3 from "web3";
export default new Web3(
  new Web3.providers.HttpProvider("https://bsc-dataseed1.binance.org/")
);
