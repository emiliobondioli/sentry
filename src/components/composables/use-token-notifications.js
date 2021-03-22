import { computed, watch } from "vue";
import { notify } from "@/utils";

export default function useTokenNotifications({ props, store, conversion }) {
  const watchRange = [];

  const tokenNotifications = computed(() => {
    const existing = store.getters["preferences/tokenNotifications"](
      props.token.address
    );
    if (existing) return existing;
    return {
      address: props.token.address,
      enable: false,
      range: null,
    };
  });

  const notificationsRange = computed(() => {
    if (tokenNotifications.value && tokenNotifications.value.range)
      return tokenNotifications.value.range;
    return {
      down: {
        value: 5,
        enable: true,
      },
      up: {
        value: 5,
        enable: true,
      },
    };
  });

  function toggleNotifications() {
    store.dispatch("preferences/tokenNotifications", {
      ...tokenNotifications.value,
      enable: !tokenNotifications.value.enable,
    });
  }

  function updateNotificationsRange(range) {
    if (range.down.value <= 0 || isNaN(range.down.value)) range.down.value = 5;
    if (range.up.value <= 0 || isNaN(range.up.value)) range.up.value = 5;
    store.dispatch("preferences/tokenNotifications", {
      ...tokenNotifications.value,
      range,
    });
  }

  function checkNotify(value) {
    if (!watchRange.length || !tokenNotifications.value.enable) return;
    if (value < watchRange[0]) {
      if(notificationsRange.value.down.enable) notify(`${props.token.symbol} DOWN - ${conversion.value.eur}€`);
      setWatchRange(value);
    }
    if (value > watchRange[1]) {
      if(notificationsRange.value.up.enable) notify(`${props.token.symbol} UP - ${conversion.value.eur}€`);
      setWatchRange(value);
    }
  }

  function setWatchRange(value) {
    watchRange[0] = value - value * notificationsRange.value.down.value / 100;
    watchRange[1] = value + value * notificationsRange.value.up.value / 100;
  }

  if (conversion) {
    watch(conversion, () => {
      if (!watchRange.length) setWatchRange(parseFloat(conversion.value.price));
    });
  }

  return {
    tokenNotifications,
    notificationsRange,
    updateNotificationsRange,
    toggleNotifications,
    checkNotify,
  };
}
