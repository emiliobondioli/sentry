import { getDefaultProvider } from "@ethersproject/providers";
import {
  ChainId,
  Route,
  TokenAmount,
  Trade,
  TradeType,
  WETH,
  Fetcher,
} from "@pancakeswap-libs/sdk";
import axios from "axios";
import web3 from "@/services/common/web3";
import { parseAddress } from "@/utils";

export default {
  namespaced: true,
  state: () => ({
    list: [],
    pairs: [],
    bnb: 220,
    history: {},
  }),
  mutations: {
    list(state, data) {
      state.list = data;
    },
    bnb(state, data) {
      state.bnb = data;
    },
    history(state, data) {
      state.history = data;
    },
    historySingle(state, data) {
      state.history[data.address] = data.history;
    },
  },
  actions: {
    async get(context) {
      await context.dispatch("bnbPrice");
      const tokens = context.rootGetters["preferences/watchedTokens"];
      const prices = tokens.map(async (t) => {
        const init = web3.init();
        await init;
        const token = await Fetcher.fetchTokenData(
          ChainId.MAINNET,
          parseAddress(t.address),
          getDefaultProvider(web3.endpoint)
        );
        const pair = await Fetcher.fetchPairData(
          WETH[ChainId.MAINNET],
          token,
          getDefaultProvider(web3.endpoint)
        );
        return { ...t, pair, token };
      });

      Promise.all(prices).then((prices) => {
        context.commit("list", prices);
        if(!context.rootState.preferences.address) return
        context.dispatch(
          "balances/get",
          {
            address: context.rootState.preferences.address,
            tokens: prices,
          },
          { root: true }
        );
      });
    },
    async bnbPrice({ commit }) {
      return axios
        .get("https://api.binance.com/api/v3/ticker/price?symbol=BNBEUR")
        .then((r) => {
          commit("bnb", parseFloat(r.data.price));
        });
    },
    add(context, address) {
      console.log(address)
      const tokens = [
        ...context.rootGetters["preferences/watchedTokens"],
        {
          address,
        },
      ];
      context.dispatch(
        "preferences/set",
        { watchedTokens: tokens },
        { root: true }
      );
      context.dispatch("get");
    },
    update(context, token) {
      const tokens = context.rootGetters["preferences/watchedTokens"];
      const i = tokens.findIndex((t) => t.address === token.address);
      tokens[i] = token;
      context.dispatch("updateWatchedTokens", tokens);
    },
    remove(context, token) {
      const tokens = context.rootGetters["preferences/watchedTokens"];
      const i = tokens.findIndex((t) => t.address === token.address);
      tokens.splice(i, 1);
      context.dispatch("updateWatchedTokens", tokens);
    },
    updateWatchedTokens(context, tokens) {
      return context.dispatch("preferences/set", { tokens }, { root: true });
    },
  },
  getters: {
    address: (state) => (address) => {
      return state.list.find((p) => p.address === address);
    },
    price: (state) => (address) => {
      return state.list.find((p) => p.address === address);
    },
    convert: (state, getters) => (amount, address) => {
      const p = getters.address(address);
      if (!p) return 0;
      let priceOnly = false
      if(amount === 0) {
        amount = 1000
        priceOnly = true
      }
      const amt = new TokenAmount(
        p.token,
        Math.pow(10, p.token.decimals) * amount
      );
      const trade = new Trade(
        new Route([p.pair], p.token),
        amt,
        TradeType.EXACT_INPUT
      );

      return {
        bnb: priceOnly ? 0 : trade.outputAmount.toSignificant(5),
        eur: priceOnly ? 0 : trade.outputAmount.multiply(parseInt(state.bnb)).toSignificant(5),
        price: trade.executionPrice.toSignificant(5),
      };
    },
  },
};
