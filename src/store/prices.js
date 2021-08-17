import { getDefaultProvider } from "@ethersproject/providers";
import * as PCSSDK from "@pancakeswap-libs/sdk";
import * as PCSSDKV2 from "@pancakeswap-libs/sdk-v2";
import axios from "axios";
import web3 from "@/services/common/web3";
import { parseAddress, tryOrNull } from "@/utils";

export default {
  namespaced: true,
  state: () => ({
    list: [],
    pairs: [],
    bnb: 220,
    history: {},
    errors: [],
  }),
  mutations: {
    list(state, data) {
      state.list = data;
    },
    errors(state, data) {
      state.errors = data;
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
    reset(state) {
      state.list = [];
      state.errors = [];
      state.history = [];
    },
  },
  actions: {
    async get(context) {
      const { ChainId, WETH } = context.getters.sdk;
      await context.dispatch("bnbPrice");
      const tokens = context.rootGetters["preferences/watchedTokens"];
      const prices = tokens.map(async (t) => {
        await web3.init();
        let token, tokenv2, pair, pairv2, error;
        token = await tryOrNull(() =>
          PCSSDK.Fetcher.fetchTokenData(
            ChainId.MAINNET,
            parseAddress(t.address),
            getDefaultProvider(web3.endpoint)
          ), 'Error getting token info'
        );
        pair = await tryOrNull(() =>
          PCSSDK.Fetcher.fetchPairData(
            WETH[ChainId.MAINNET],
            token,
            getDefaultProvider(web3.endpoint)
          ), 'Error getting pair info'
        );
        tokenv2 = await tryOrNull(() =>
          PCSSDKV2.Fetcher.fetchTokenData(
            ChainId.MAINNET,
            parseAddress(t.address),
            getDefaultProvider(web3.endpoint)
          ), 'Error getting token V2 info'
        );
        pairv2 = await tryOrNull(() =>
          PCSSDKV2.Fetcher.fetchPairData(
            WETH[ChainId.MAINNET],
            token,
            getDefaultProvider(web3.endpoint)
          ), 'Error getting pair V2 info'
        );
        error = (pair || pairv2) && (token || tokenv2)
        return { ...t, pair, pairv2, token, tokenv2, error };
      });

      Promise.all(prices).then((prices) => {
        context.commit("errors", []);
        const validPrices = prices.filter((t) => t.pair || t.pairv2);
        const errored = prices.filter((t) => t.error);
        context.commit("list", validPrices);
        context.commit("errors", errored);
        if (!context.rootState.preferences.address) return;
        context.dispatch(
          "balances/get",
          {
            address: context.rootState.preferences.address,
            tokens: validPrices,
          },
          { root: true }
        );
      });
    },
    async bnbPrice(context) {
      let fiat = context.rootGetters["preferences/fiat"];
      if (fiat === "USD") fiat = "USDT";
      return axios
        .get("https://api.binance.com/api/v3/ticker/price?symbol=BNB" + fiat)
        .then((r) => {
          context.commit("bnb", parseFloat(r.data.price));
        });
    },
    add(context, token) {
      const tokens = [
        ...context.rootGetters["preferences/watchedTokens"],
        token,
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
    updateAmount(context, data) {
      const token = context.rootGetters["preferences/watchedToken"](
        data.address
      );
      if (token) {
        token.amount = data.amount;
      }
      context.dispatch("update", token);
    },
    remove(context, token) {
      const tokens = context.rootGetters["preferences/watchedTokens"];
      const i = tokens.findIndex((t) => t.address === token.address);
      tokens.splice(i, 1);
      context.dispatch("updateWatchedTokens", tokens);
    },
    updateWatchedTokens(context, tokens) {
      tokens = tokens.map((t) => {
        return {
          address: t.address,
          name: t.name,
          symbol: t.symbol,
          amount: t.amount,
        };
      });
      return context.dispatch(
        "preferences/set",
        { watchedTokens: tokens },
        { root: true }
      );
    },
  },
  getters: {
    sdk: (state, getters, rootState, rootGetters) => {
      return rootGetters["preferences/sdk"] === 0 ? PCSSDK : PCSSDKV2;
    },
    address: (state) => (address) => {
      return state.list.find((p) => p.address === address);
    },
    error: (state) => (address) => {
      return state.errors.find((e) => e.address === address);
    },
    price: (state) => (address) => {
      return state.list.find((p) => p.address === address);
    },
    convert: (state, getters, rootState, rootGetters) => (amount, address) => {
      const p = getters.address(address);
      console.log('convert', address, p)
      if (!p) return 0;
      const { Route, TokenAmount, Trade, TradeType } = getters.sdk;
      let priceOnly = false;
      if (!amount) {
        amount = 1;
        priceOnly = true;
      }
      let amt;
      const token =
        rootGetters["preferences/sdk"] && p.tokenv2 ? p.tokenv2 : p.token;
      const pair =
        rootGetters["preferences/sdk"] && p.pairv2 ? p.pairv2 : p.pair;
      try {
        amt = new TokenAmount(token, amount * Math.pow(10, token.decimals));
      } catch (e) {
        console.error(`Error setting token amount for ${address}`, e);
        priceOnly = true;
        amt = new TokenAmount(token, 1 * Math.pow(10, token.decimals));
      }
      const trade = new Trade(
        new Route([pair], token),
        amt,
        TradeType.EXACT_INPUT
      );

      console.log(trade.executionPrice.toSignificant(5))

      return {
        bnb: priceOnly ? 0 : trade.outputAmount.toSignificant(5),
        fiat: priceOnly
          ? 0
          : trade.outputAmount.multiply(parseInt(state.bnb)).toSignificant(5),
        price: trade.executionPrice.toSignificant(5),
        priceBN: trade.executionPrice.toFixed(18),
        priceFiat: trade.executionPrice.toSignificant(5) * state.bnb,
      };
    },
  },
};
