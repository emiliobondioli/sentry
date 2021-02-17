import axios from "axios";
import Web3 from "web3";

/** init web3 with BSCScan provider */
const web3 = new Web3(
  new Web3.providers.HttpProvider("https://bsc-dataseed1.binance.org/")
);

/** BSCScan API params */
const baseUrl = "https://api.bscscan.com/api";
const API_TOKEN = "TF9Q3E4IQ4MVN5WPDHE2J6RXUQUAH97E88";

const config = {
  name: "Autofarm",
  url: "https://api.autofarm.network/bsc/get_farms_data",
  address: "0x0895196562c7868c5be92459fae7f877ed450452",
  value: (r) =>
    Object.keys(r.data.pools).map((k) => {
      const pool = r.data.pools[k];
      const data = r.data.table_data.find((d) => d[2] === pool.wantName);
      if (data) pool.farmPid = data[0];
      return pool;
    }),
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
};

const pools = [];

function initPools() {
  get(config.url).then((r) => {
    const pools = config.value(r);
    pools.forEach((pool, id) => preparePool({ pool, id }));
    console.log(pools);
  });
}

initPools();

function preparePool({ pool, id }) {
  const data = {
    name: config.name,
    url: config.url,
    address: config.address,
    id,
  };
  for (const k in config.keys) {
    if (typeof config.keys[k] === "function") {
      data[k] = config.keys[k](pool);
    } else {
      data[k] = pool[config.keys[k]];
    }
  }
  data.pool = pool;
  pools.push(data);
}

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
      value: convertValue(t.value),
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

function convertValue(value) {
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
  const contractAddress = vault.address;
  /** TODO: add batching */
  /*   var batch = new web3.BatchRequest();
batch.add(contract.methods.balance(address).call.request({from: '0x0000000000000000000000000000000000000000'}, callback2));
batch.execute(); */
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
      console.log(vault, contract);
      if (contract.methods.stakedWantTokens) {
        contract.methods
          .stakedWantTokens(vault.pid, address)
          .call()
          .then((r) => {
            console.log(vault.name, "stakedWantTokens", convertValue(r));
          });
      }
      return contract;
    } else {
      console.log("Error");
    }
  });
}

function get(url, params) {
  return axios.get(url, { params });
}

function parseAddress(address) {
  if (!address) return null;
  return address.toLowerCase();
}
