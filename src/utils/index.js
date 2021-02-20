import web3 from "@/services/common/web3";

export function intersection(arr1, arr2) {
  return arr1.filter((el) => arr2.includes(el));
}

export function convertValue(value) {
  return web3.utils.fromWei(value);
}

export function parseAddress(address) {
  if (!address) return null;
  return web3.utils.toChecksumAddress(address);
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

/**
 * Gets single token amounts for LP pools for past blocks
 * @param {pool} pool
 */
export function computePoolHistoryTokens(pool, pair) {
  const depositHistory = pair.history.map((h) => ({
    token0Price: parseFloat(h.token0Price),
    token1Price: parseFloat(h.token1Price),
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
    depositedSingleTokens: totalDeposit,
    yieldSingleTokens: {
      token0Amount:
        pool.currentSingleTokens.token0Amount - totalDeposit.token0Amount,
      token1Amount:
        pool.currentSingleTokens.token1Amount - totalDeposit.token1Amount,
    },
  };
}
