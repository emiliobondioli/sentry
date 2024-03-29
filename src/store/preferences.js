import config from "@/config/env";

export default {
  namespaced: true,
  state: () => ({
    fiat: "USD",
    darkMode: true,
    address: null,
    platforms: [],
    tokenNotifications: [],
    watchedTokens: [],
    tokens: [],
    browserNotifications: false,
    soundNotifications: true,
    sdk: 0,
  }),
  mutations: {
    address(state, data) {
      state.address = data;
    },
    sdk(state, data) {
      state.sdk = data;
    },
    watchedTokens(state, data) {
      state.watchedTokens = data;
    },
    watchedToken(state, data) {
      if (!data.address) return;
      state.watchedTokens = data;
      const i = state.watchedTokens.findIndex(
        (n) => n.address === data.address
      );
      if (i >= 0) {
        state.watchedTokens[i] = data;
      }
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
    browserNotifications(state, data) {
      state.browserNotifications = data;
    },
    soundNotifications(state, data) {
      state.soundNotifications = data;
    },
    tokenNotifications(state, data) {
      if (!Array.isArray(data)) {
        data = Object.keys(data).map((k) => {
          return {
            address: k,
            enable: data[k],
            range: null,
          };
        });
      }
      state.tokenNotifications = data;
    },
    tokenNotification(state, data) {
      if (!data.address) return;
      const i = state.tokenNotifications.findIndex(
        (n) => n.address === data.address
      );
      if (i >= 0) {
        state.tokenNotifications[i] = data;
      } else {
        state.tokenNotifications = [...state.tokenNotifications, data];
      }
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
      if (preferences) {
        const p = JSON.parse(preferences);
        context.dispatch("set", p);
      }
    },
    set(context, data) {
      Object.keys(data).forEach((k) => context.commit(k, data[k]));
      context.dispatch("save");
    },
    tokenNotifications(context, data) {
      context.commit("tokenNotification", data);
      context.dispatch("save");
    },
    updateSDK(context, value) {
      context.commit("prices/reset", null, { root: true });
      context.commit("sdk", value);
      context.dispatch("prices/get", null, { root: true });
      context.dispatch("save");
    },
  },
  getters: {
    tokenNotifications: (state) => (address) => {
      return (
        state.tokenNotifications.find((n) => n.address === address) || false
      );
    },
    watchedTokens: (state) => {
      return state.watchedTokens;
    },
    sdk: (state) => {
      return state.sdk;
    },
    watchedToken: (state) => (address) => {
      return state.watchedTokens.find((t) => t.address === address);
    },
    address: (state) => state.address,
    fiat: (state) => {
      return state.fiat;
    },
  },
};
