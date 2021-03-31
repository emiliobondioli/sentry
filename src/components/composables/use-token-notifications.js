import { computed } from "vue";
import { browserNotification } from "@/utils";
import { playSound } from "@/utils";
import { useNotificationStore } from "@dafcoe/vue-notification";

export default function useTokenNotifications({ props, store }) {
  const watchRange = [];
  const { setNotification } = useNotificationStore();

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

  function checkNotify(conversion) {
    if (!conversion) return;
    const value = parseFloat(conversion.price);
    if (!watchRange.length) setWatchRange(parseFloat(conversion.price));
    if (!tokenNotifications.value.enable) return;
    if (value < watchRange[0]) {
      if (notificationsRange.value.down.enable) {
        const text = `${props.token.symbol} DOWN - ${conversion.fiat}€`;
        const notification = {
          text,
          type: "down",
        };
        notify(notification);
      }
      setWatchRange(value);
    }
    if (value > watchRange[1]) {
      if (notificationsRange.value.up.enable) {
        const text = `${props.token.symbol} UP - ${conversion.fiat}€`;
        const notification = {
          text,
          type: "up",
        };
        notify(notification);
      }
      setWatchRange(value);
    }
  }

  function notify(notification) {
    if (store.state.preferences.browserNotifications)
      browserNotification(notification.text);
    if (store.state.preferences.soundNotifications) {
      if (notification.type === "up")
        playSound(require("@/assets/sounds/up.mp3"));
      else playSound(require("@/assets/sounds/down.mp3"));
    }
    setNotification({
      message: notification.text,
      type: "info",
      showIcon: false,
      duration: 5000,
      appearance: "dark",
    });
    store.dispatch("notifications/create", notification);
  }

  function setWatchRange(value) {
    watchRange[0] = value - (value * notificationsRange.value.down.value) / 100;
    watchRange[1] = value + (value * notificationsRange.value.up.value) / 100;
  }

  return {
    tokenNotifications,
    notificationsRange,
    updateNotificationsRange,
    toggleNotifications,
    checkNotify,
    notify,
  };
}
