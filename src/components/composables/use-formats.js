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
  const currentFiat = computed(() => store.state.fiat);

  const currency = (value, n = 5) => {
    if (value === 0)
      return value.toLocaleString(undefined, {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      });
    return value.toLocaleString(undefined, {
      minimumFractionDigits: n,
      maximumFractionDigits: n,
    });
  };

  const lpPair = (pair) => {
    return `${currency(pair.token0, 3)} ${pair.symbolToken0} / ${currency(
      pair.token1,
      3
    )} ${pair.symbolToken1} `;
  };

  const fiat = (value, n = 3, sign = false) => {
    let e = 1;
    let prefix = "";
    if (sign && value >= 0) prefix = "+";
    if (currencies.value && currentFiat.value)
      e = currencies.value[currentFiat.value] || 1;
    return prefix + currency(value / e, n) + symbols[currentFiat.value];
  };

  const setFiat = (name) => {
    store.commit("fiat", name);
  };

  return {
    currencies,
    currentFiat,
    currency,
    fiat,
    lpPair,
    setFiat,
  };
}
