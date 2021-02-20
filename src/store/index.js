import { createStore } from "vuex";
import config from "@/config/env";
import platforms from "@/config/platforms";
import services from "@/services";
import { merge, isSameAddress, computeLPPoolTokens } from "@/utils";
import tokenService from "@/services/common/token-service";

export const store = createStore({
  state() {
    return {
      platforms,
      currencies: null,
      farms: [],
      history: [],
      tokens: {
        pairs: [],
        tokens: [],
      },
      preferences: {
        fiat: "USD",
        darkMode: true,
        address: "",
        platforms: [],
      },
      loadingTokens: false,
    };
  },
  mutations: {
    farms(state, data) {
      state.farms = data;
    },
    farm(state, data) {
      state.farms = merge(state.farms, data);
    },
    currencies(state, data) {
      data.USD = 1;
      delete data.WBNB;
      state.currencies = data;
    },
    loadingTokens(state, data) {
      state.loadingTokens = data;
    },
    preferences(state, data) {
      state.preferences = data;
    },
    history(state, data) {
      state.history = data;
    },
    record(state, data) {
      state.history = [...state.history, data];
    },
    tokens(state, data) {
      state.tokens = data;
    },
  },
  actions: {
    get(context, { address, platforms }) {
      context.dispatch("preferences", { address });
      const promises = [];
      platforms.forEach((platformId) => {
        const service = services[platformId];
        promises.push(
          service.scan(address).then((farm) => {
            context.commit("farm", farm);
            return farm;
          })
        );
      });
      return Promise.all(promises).then(() => {
        context.dispatch("tokensInfo");
      });
    },
    tokensInfo(context) {
      const pools = context.state.farms.map((f) => f.pools).flat();

      const deposits = pools
        .filter((p) => p.lp)
        .map((p) =>
          p.transactions.filter((t) =>
            isSameAddress(t.from, context.state.preferences.address)
          )
        )
        .flat();

      const tokens = pools
        .map((p) => {
          let t;
          if (p.lp) t = { pair: p.wantAddress };
          else t = { token: p.wantAddress };
          if (p.rewardAddress) t.reward = p.rewardAddress;
          return t;
        })
        .reduce(
          (acc, curr) => {
            const t = { ...acc };
            if (curr.pair) t.pairs = [...t.pairs, curr.pair];
            if (curr.token) t.tokens = [...t.tokens, curr.token];
            if (curr.reward) t.tokens = [...t.tokens, curr.reward];
            return t;
          },
          { pairs: [], tokens: [], deposits }
        );

      context.commit("loadingTokens", true);
      return tokenService.getInfo(tokens).then((tokens) => {
        context.commit("loadingTokens", false);
        context.commit("tokens", tokens);
        context.dispatch("computePoolsHistory");
      });
    },
    computePoolsHistory(context) {
      const farms = context.state.farms.map((f) => {
        f.pools = f.pools.map((p) => {
          if (!p.lp) return p;
          const pair = context.getters.pair(p.wantAddress);
          if (pair) return computeLPPoolTokens(p, pair);
          return p;
        });
        return f;
      });
      context.commit("farms", farms);
      context.commit("record", context.state.farms);
      context.dispatch("saveHistory");
    },
    saveHistory(context) {
      localStorage.setItem(
        config.localStoragePrefix + "history",
        JSON.stringify(context.state.history)
      );
    },
    savePreferences(context) {
      localStorage.setItem(
        config.localStoragePrefix + "preferences",
        JSON.stringify(context.state.preferences)
      );
    },
    loadPreferences(context) {
      const preferences = localStorage.getItem(
        config.localStoragePrefix + "preferences"
      );
      if (preferences) context.commit("preferences", JSON.parse(preferences));
    },
    loadHistory(context) {
      let history = localStorage.getItem(config.localStoragePrefix + "history");
      if (!history) history = [];
      else history = JSON.parse(history);
      context.commit("history", history);
      if (history.length) {
        context.dispatch("setCurrent", history[history.length - 1]);
      }
    },
    preferences(context, data) {
      context.commit("preferences", { ...context.state.preferences, ...data });
      context.dispatch("savePreferences");
    },
    setCurrent(context, data) {
      context.commit("farms", null);
      context.commit("tokens", {
        pairs: [],
        tokens: [],
      });
      setTimeout(() => {
        context.commit("farms", data);
        context.dispatch("tokensInfo");
      });
    },
  },
  getters: {
    tokens: (state) => {
      return state.tokens.tokens.concat(
        state.tokens.pairs.map((p) => [p.token0, p.token1]).flat()
      );
    },
    token: (state, getters) => (id) => {
      const tokens = getters.tokens;
      if (!tokens) return null;
      return tokens.find((token) => isSameAddress(token.id, id));
    },
    pair: (state) => (id) => {
      return state.tokens.pairs.find((pair) => isSameAddress(pair.id, id));
    },
    symbol: (state, getters) => (id) => {
      const tokens = getters.tokens;
      const t = tokens.find((token) => isSameAddress(token.id, id));
      return t ? t.symbol : "";
    },
  },
});
