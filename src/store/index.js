import { createStore } from "vuex";
import { fetchData } from "@/services";
import mock from "@/assets/data/mock.js";

export const store = createStore({
  state() {
    return {
      platforms: null,
      currencies: null,
      fiat: "EUR",
      history: [],
    };
  },
  mutations: {
    platforms(state, data) {
      state.platforms = data;
    },
    currencies(state, data) {
      data.USD = 1;
      state.currencies = data;
    },
    fiat(state, data) {
      state.fiat = data;
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
      context.commit("platforms", null);
      return fetchData(address, ["auto"]).then((r) => {
        context.commit("record", { time: new Date(), address, ...r.data });
        context.dispatch("save", address);
        context.dispatch("set", r.data);
      });
    },
    save(context, address) {
      localStorage.setItem(
        "yolo-" + address,
        JSON.stringify(context.state.history)
      );
    },
    load(context, address) {
      let history = localStorage.getItem("yolo-" + address);
      if (!history) history = [];
      else history = JSON.parse(history);
      context.commit("history", history);
      context.dispatch("set", history[history.length - 1]);
    },
    set(context, data) {
      context.commit("platforms", data);
      context.commit("currencies", data.currencies);
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
