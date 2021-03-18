import config from "@/config/env";

const tokens = [
  {
    name: "SafeMoon",
    symbol: "SAFEMOON",
    address: "0x8076c74c5e3f5852037f31ff0093eeb8c8add8d3",
  },
  {
    name: "Tedesis",
    symbol: "TDI",
    address: "0x57FB0eA298De58b2a2a442B66aFFebF9565695Eb",
  },
];

export default {
  namespaced: true,
  state: () => ({
    fiat: "USD",
    darkMode: true,
    address: null,
    platforms: [],
    priceNotifications: {},
    watchedTokens: [],
    tokens: []
  }),
  mutations: {
    address(state, data) {
      state.address = data;
    },
    watchedTokens(state, data) {
      state.watchedTokens = data;
    },
    tokens(state, data) {
      state.tokens = data;
    },
    fiat(state, data) {
      state.fiat = data;
    },
    platforms(state, data) {
      state.platforms = data;
    },
    darkMode(state, data) {
      state.darkMode = data;
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
      if (preferences) context.dispatch("set", JSON.parse(preferences));
    },
    set(context, data) {
      Object.keys(data).forEach((k) => context.commit(k, data[k]));
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
    watchedTokens: (state) => {
      return state.watchedTokens;
    },
    address: (state) => state.address,
  },
};
