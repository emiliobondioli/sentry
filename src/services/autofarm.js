import axios from "axios";
import Web3 from "web3";
const web3 = new Web3(
  new Web3.providers.HttpProvider("https://bsc-dataseed1.binance.org/")
);

const baseUrl = "https://api.bscscan.com/api";
const API_TOKEN = "TF9Q3E4IQ4MVN5WPDHE2J6RXUQUAH97E88";

const FARMS = [
  {
    name: "Autofarm",
    url: "https://api.autofarm.network/bsc/get_farms_data",
    value: (r) => Object.keys(r.data.pools).map((k) => r.data.pools[k]),
    address: "0x0895196562c7868c5be92459fae7f877ed450452",
    keys: {
      name: "wantName",
      contractAddress: (f) => parseAddress(f.farmContractAddress),
      stratAddress: (f) => f.poolInfo.strat,
      farm: "farmName",
      lp: "wantIsLP",
      pid: (f) => parseInt(f.farmPid),
      earnedAddress: (f) => parseAddress(f.earnedAddress),
      wantAddress: (f) => parseAddress(f.wantAddress),
    },
  },
];

const pools = [];

function parseAddress(address) {
  if (!address) return null;
  return address.toLowerCase();
}

export function initFarms() {
  FARMS.forEach((farm) => {
    get(farm.url).then((r) => {
      const pools = farm.value(r);
      pools.forEach((pool, id) => preparePool({ pool, id }, farm));
      console.log(pools);
    });
  });
}

function preparePool({ pool, id }, farm) {
  const data = {
    name: farm.name,
    url: farm.url,
    address: farm.address,
    id,
  };
  for (const k in farm.keys) {
    if (typeof farm.keys[k] === "function") {
      data[k] = farm.keys[k](pool);
    } else {
      data[k] = pool[farm.keys[k]];
    }
  }
  data.pool = pool;
  pools.push(data);
}

initFarms();

let account = {};

export function scan(address) {
  return getTransactions(address).then((transactions) => {
    account = { address, transactions };
    console.log(account);
    const vaults = pools
      .map((c) => {
        return {
          ...c,
          transactions: transactions.filter((t) => {
            const isFarmAddress = [t.to, t.from].includes(c.address);
            const isFarmToken = t.contractAddress === c.wantAddress;
            return isFarmAddress && isFarmToken;
          }),
        };
      })
      .filter((c) => c.transactions.length)
      .map(prepareVault)
      .filter((v) => v.balance > 0);
    console.log(vaults);
    vaults.forEach((v) => {
      getContractInfo(v, address);
    });
  });
}

function prepareVault(vault) {
  const transactions = vault.transactions.map((t) => {
    return {
      date: new Date(t.timeStamp * 1000),
      timestamp: t.timeStamp,
      value: toBNB(t.value),
      to: t.to,
      from: t.from,
      contractAddress: t.contractAddress,
      tokenSymbol: t.tokenSymbol,
      original: t,
    };
  });
  return {
    ...vault,
    balance: transactions
      .map((t) => (t.to === vault.address ? t.value : t.value * -1))
      .reduce((a, b) => a + b, 0),
    transactions,
  };
}

function toBNB(value) {
  return Number(value) * 0.000000000000000001;
}

function getTransactions(address) {
  return get(baseUrl, {
    address,
    module: "account",
    action: "tokentx",
    apikey: API_TOKEN,
  }).then((r) => {
    return r.data.result;
  });
}

function getInternalTransactions(address) {
  return get(baseUrl, {
    address,
    module: "account",
    action: "txlistinternal",
    apikey: API_TOKEN,
  }).then((r) => {
    return r.data.result;
  });
}

function getContractInfo(vault, address) {
  //if (vault.name != "WBNB-CAKE LP") return;
  const contractAddress = vault.address;
  return get(baseUrl, {
    address: contractAddress,
    module: "contract",
    action: "getabi",
    apikey: API_TOKEN,
  }).then((r) => {
    let contractABI = "";
    contractABI = JSON.parse(r.data.result);

    if (contractABI != "") {
      const contract = new web3.eth.Contract(contractABI, contractAddress);
      console.log(vault, contract.methods);
      contract.methods
        .userInfo(vault.id + 1, address)
        .call()
        .then((r) => {
/*           console.log(vault.name, r, {
            0: toBNB(r[0]),
            1: toBNB(r[1]),
            shares: toBNB(r.shares),
            rewardDebt: toBNB(r.rewardDebt),
          }); */
        });
      contract.methods
        .stakedWantTokens(vault.id + 1, address)
        .call()
        .then((r) => {
          console.log(vault.name, toBNB(r));
        });
      return contract;
    } else {
      console.log("Error");
    }
  });
}

function get(url, params) {
  return axios.get(url, { params });
}
