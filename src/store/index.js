import { createStore } from "vuex";
import config from "@/config/env";
import platforms from "@/config/platforms";
import services from "@/services";
import { merge } from "@/utils";
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
            context.commit("record", context.state.farms);
            context.dispatch("saveHistory");
            return farm;
          })
        );
      });
      return Promise.all(promises).then(() => {
        context.dispatch("tokensInfo");
      });
    },
    tokensInfo(context) {
      const tokens = context.state.farms
        .map((f) => f.pools)
        .flat()
        .map((p) => {
          if (p.lp) return { pair: p.wantAddress };
          else return { token: p.wantAddress };
        })
        .reduce(
          (acc, curr) => {
            if (curr.pair) return { ...acc, pairs: [...acc.pairs, curr.pair] };
            else if (curr.token)
              return { ...acc, tokens: [...acc.tokens, curr.token] };
            return acc;
          },
          { pairs: [], tokens: [] }
        );
      return tokenService.getInfo(tokens).then((r) => {
        console.log(r);
        context.commit("tokens", r.data.data);
      });
    },
    saveHistory(context, address) {
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
      setTimeout(() => {
        context.commit("farms", data);
        context.dispatch("tokensInfo");
      });
    },
  },
  getters: {
    token: (state) => (id) => {
      console.log(id, state.tokens.tokens);
      return state.tokens.tokens.find((token) => token.id === id);
    },
    pair: (state) => (id) => {
      console.log(id, state.tokens.pairs);
      return state.tokens.pairs.find((pair) => pair.id === id);
    },
  },
});
