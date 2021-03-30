import Web3 from "web3";

export function intersection(arr1, arr2) {
  return arr1.filter((el) => arr2.includes(el));
}

export function convertValue(value) {
  return parseFloat(Web3.utils.fromWei(value));
}

export function parseAddress(address) {
  if (!address) return null;
  return Web3.utils.toChecksumAddress(address);
}

export function isSameAddress(address0, address1) {
  if (!address0 || !address1) return false;
  return address0.toLowerCase() === address1.toLowerCase();
}

export function copyToClipboard(text) {
  var textArea = document.createElement("textarea");
  textArea.style.position = "fixed";
  textArea.style.top = 0;
  textArea.style.left = 0;
  textArea.style.width = "2em";
  textArea.style.height = "2em";
  textArea.style.padding = 0;
  textArea.style.border = "none";
  textArea.style.outline = "none";
  textArea.style.boxShadow = "none";
  textArea.style.background = "transparent";
  textArea.value = text;
  document.body.appendChild(textArea);
  textArea.focus();
  textArea.select();
  try {
    document.execCommand("copy");
  } catch (err) {
    console.log(err);
  }
  document.body.removeChild(textArea);
}

export function merge(array, data) {
  const idx = array.findIndex((e) => e.id === data.id);
  if (idx < 0) return [...array, data];
  array[idx] = data;
  return array;
}

export function percentageChange(a, b) {
  if (a === 0) return 0;
  let percent;
  if (b !== 0) {
    if (a !== 0) {
      percent = ((b - a) / a) * 100;
    } else {
      percent = b * 100;
    }
  } else {
    percent = -a * 100;
  }
  return Math.floor(percent);
}

export function map(n, in_min, in_max, out_min, out_max) {
  return ((n - in_min) * (out_max - out_min)) / (in_max - in_min) + out_min;
}

export function browserNotification(text) {
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

export function playSound(url) {
  const audio = new Audio(url);
  audio.play();
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
