import { createStore } from "vuex";
import { fetchData } from "@/services";
import mock from "@/assets/data/mock.js";

export const store = createStore({
  state() {
    return {
      platforms: null,
      currencies: null,
      history: [],
      preferences: {
        fiat: "USD",
      },
    };
  },
  mutations: {
    platforms(state, data) {
      state.platforms = data;
    },
    currencies(state, data) {
      data.USD = 1;
      delete data.WBNB
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
    get(context, address) {
      context.dispatch("preferences", { address });
      return fetchData(address, ["auto"]).then((r) => {
        context.commit("record", { time: new Date(), address, ...r.data });
        context.dispatch("saveHistory", address);
        context.dispatch("setCurrent", r.data);
      });
    },
    saveHistory(context, address) {
      localStorage.setItem(
        "wt-h-" + address,
        JSON.stringify(context.state.history)
      );
    },
    savePreferences(context) {
      localStorage.setItem(
        "watchtower-preferences",
        JSON.stringify(context.state.preferences)
      );
    },
    loadPreferences(context) {
      const preferences = localStorage.getItem("watchtower-preferences");
      if (preferences) context.commit("preferences", JSON.parse(preferences));
    },
    loadHistory(context, address) {
      let history = localStorage.getItem("wt-h-" + address);
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
      context.commit("platforms", null);
      setTimeout(() => {
        context.commit("platforms", data);
        context.commit("currencies", data.currencies);
      })
    },
    mock(context) {
      return Promise.resolve(mock).then((r) => {
        context.commit("platforms", r.result);
        context.commit("currencies", r.result.currencies);
      });
    },
  },
  getters: {},
});
