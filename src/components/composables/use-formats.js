import { computed } from "vue";

const symbols = {
  EUR: "€",
  USD: "$",
  BTCB: "₿",
  GBP: "£",
  RMB: "CN¥",
  JPY: "JP¥",
};

export default function useFormats(store) {
  const currencies = computed(() => store.state.currencies);
  const currentFiat = computed(() => store.state.preferences.fiat);

  const lpPair = (pair) => {
    return `${currency(pair.token0Amount, 5)} ${
      pair.token0.symbol
    } / ${currency(pair.token1Amount, 5)} ${pair.token1.symbol} `;
  };

  const fiat = (value, n = 2, sign = false) => {
    let prefix = "";
    if (sign && value >= 0) prefix = "+";
    return prefix + currency(value, n) + symbols[currentFiat.value];
  };

  const sign = (value, n = 2) => {
    let prefix = "";
    if (value >= 0) prefix = "+";
    return prefix + currency(value, n);
  };

  const setFiat = (name) => {
    store.dispatch("preferences/set", { fiat: name });
  };

  const symbol = (address) => store.getters.symbol(address);

  return {
    currencies,
    currentFiat,
    sign,
    currency,
    fiat,
    lpPair,
    setFiat,
    symbol,
  };
}

export function currency(value, n = 5) {
  if (!value)
    return "0".toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  return parseFloat(value).toLocaleString(undefined, {
    minimumFractionDigits: n,
    maximumFractionDigits: n,
  });
}

export function toK(value) {
  const abs = Math.abs(value);
  if (abs > 999 && abs < 1000000) {
    return (value / 1000).toFixed(1) + "K";
  } else if (abs > 1000000) {
    return (value / 1000000).toFixed(1) + "M";
  } else if (abs > 1000000000) {
    return (value / 1000000000).toFixed(1) + "T";
  } else if (abs < 900) {
    return value.toFixed(1);
  }
}
