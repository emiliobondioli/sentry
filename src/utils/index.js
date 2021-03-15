import web3 from "@/services/common/web3";
import Web3 from "web3";
import Web3Modal from "web3modal";

export function intersection(arr1, arr2) {
  return arr1.filter((el) => arr2.includes(el));
}

export function convertValue(value) {
  return parseFloat(web3.utils.fromWei(value));
}

export function parseAddress(address) {
  if (!address) return null;
  return web3.utils.toChecksumAddress(address);
}

export function isSameAddress(address0, address1) {
  if (!address0 || !address1) return false;
  return address0.toLowerCase() === address1.toLowerCase();
}

export function merge(array, data) {
  const idx = array.findIndex((e) => e.id === data.id);
  if (idx < 0) return [...array, data];
  array[idx] = data;
  return array;
}

export function percentageChange(n, p) {
  return n + n * (p / 100);
}

export function map(n, in_min, in_max, out_min, out_max) {
  return ((n - in_min) * (out_max - out_min)) / (in_max - in_min) + out_min;
}

export function notify(text) {
  if (!("Notification" in window)) {
    return;
  } else if (Notification.permission === "granted") {
    new Notification(text);
  } else if (Notification.permission !== "denied") {
    Notification.requestPermission().then(function(permission) {
      if (permission === "granted") {
        new Notification(text);
      }
    });
  }
}

export function truncate(string, length = 8) {
  if (!string) return "";
  return string.substr(0, length) + "...";
}

/**
 * Gets single token amounts for LP pools for past blocks
 * @param {pool} pool
 */
export function computeLPPoolTokens(pool, pair) {
  const currentSingleTokens = {
    token0Amount: (pool.currentTokens / pair.totalSupply) * pair.reserve0,
    token1Amount: (pool.currentTokens / pair.totalSupply) * pair.reserve1,
  };

  const depositHistory = pair.history.map((h) => ({
    token0Price: h.token0Price,
    token1Price: h.token1Price,
    token0Amount: (h.value / h.totalSupply) * h.reserve0,
    token1Amount: (h.value / h.totalSupply) * h.reserve1,
  }));

  const totalDeposit = depositHistory.reduce(
    (acc, curr) => {
      acc.token0Amount += curr.token0Amount;
      acc.token1Amount += curr.token1Amount;
      acc.token0Price += curr.token0Price;
      acc.token1Price += curr.token1Price;
      return acc;
    },
    { token0Amount: 0, token1Amount: 0, token0Price: 0, token1Price: 0 }
  );

  totalDeposit.token0Price /= depositHistory.length;
  totalDeposit.token1Price /= depositHistory.length;

  return {
    ...pool,
    lpComputed: true,
    depositedSingleTokens: totalDeposit,
    currentSingleTokens,
    yieldSingleTokens: {
      token0Amount:
        currentSingleTokens.token0Amount - totalDeposit.token0Amount,
      token1Amount:
        currentSingleTokens.token1Amount - totalDeposit.token1Amount,
    },
  };
}
