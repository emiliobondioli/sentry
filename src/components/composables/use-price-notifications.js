import { computed, watch } from "vue";
import { notify } from "@/utils";

export default function usePriceNotifications({ props, store, conversion }) {
  const watchRange = [];

  const priceNotifications = computed(() =>
    store.getters["preferences/priceNotifications"](props.token.address)
  );

  function toggleNotifications() {
    store.dispatch("preferences/priceNotifications", {
      address: props.token.address,
      value: !priceNotifications.value,
    });
  }

  function checkNotify(value) {
    if (!watchRange.length) return;
    if (value < watchRange[0]) {
      if (priceNotifications.value)
        notify(`${props.token.symbol} DOWN - ${conversion.value.eur}€`);
      setWatchRange(value);
    }
    if (value > watchRange[1]) {
      if (priceNotifications.value)
        notify(`${props.token.symbol} UP - ${conversion.value.eur}€`);
      setWatchRange(value);
    }
  }

  function setWatchRange(value) {
    watchRange[0] = value - value * 0.05;
    watchRange[1] = value + value * 0.05;
  }

  watch(conversion, () => {
    if (!watchRange.length) setWatchRange(parseFloat(conversion.value.price));
  });

  return {
    priceNotifications,
    toggleNotifications,
    checkNotify,
  };
}
