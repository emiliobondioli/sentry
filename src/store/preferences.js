import config from "@/config/env";

export default {
  namespaced: true,
  state: () => ({
    fiat: "USD",
    darkMode: true,
    address: "",
    platforms: [],
    priceNotifications: {},
  }),
  mutations: {
    preferences(state, data) {
      Object.keys(data).forEach((k) => (state[k] = data[k]));
    },
    priceNotifications(state, data) {
      state.priceNotifications[data.address] = data.value;
    },
  },
  actions: {
    save(context) {
      localStorage.setItem(
        config.localStoragePrefix + "preferences",
        JSON.stringify(context.state)
      );
    },
    load(context) {
      const preferences = localStorage.getItem(
        config.localStoragePrefix + "preferences"
      );
      if (preferences) context.commit("preferences", JSON.parse(preferences));
    },
    set(context, data) {
      context.commit("preferences", { ...context.states, ...data });
      context.dispatch("save");
    },
    priceNotifications(context, data) {
      context.commit("priceNotifications", data);
      context.dispatch("save");
    },
  },
  getters: {
    priceNotifications: (state) => (address) => {
      return state.priceNotifications[address] || false;
    },
  },
};
