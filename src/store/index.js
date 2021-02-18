import { createStore } from "vuex";
import config from "@/config/env";
import platforms from "@/config/platforms";
import services from "@/services";
import { merge } from "@/utils";

export const store = createStore({
  state() {
    return {
      platforms,
      currencies: null,
      farms: [],
      history: [],
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
          })
        );
      });
      return Promise.all(promises)
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
      });
    },
  },
  getters: {},
});
