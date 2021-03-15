import ERC20_ABI from "@/assets/abis/ERC20.json";

import Web3 from "web3";
let web3 = new Web3(
  new Web3.providers.HttpProvider("https://bsc-dataseed1.binance.org/")
);
export default web3;

export function setProvider(provider) {
  web3 = provider;
}