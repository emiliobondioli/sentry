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
  },
  actions: {
    async get(context) {
      await context.dispatch("bnbPrice");
      const tokens = context.rootGetters["preferences/watchedTokens"];
      const prices = tokens.map(async (t) => {
        await web3.init();
        let token, pair, error;
        try {
          token = await Fetcher.fetchTokenData(
            ChainId.MAINNET,
            parseAddress(t.address),
            getDefaultProvider(web3.endpoint)
          );
          pair = await Fetcher.fetchPairData(
            WETH[ChainId.MAINNET],
            token,
            getDefaultProvider(web3.endpoint)
          );
        } catch (e) {
          console.error(`Error getting token info for ${t.address}`, e.message);
          token = null;
          pair = null;
          error = true;
        }
        return { ...t, pair, token, error };
      });

      Promise.all(prices).then((prices) => {
        context.commit("errors", []);
        const validPrices = prices.filter((t) => t.pair);
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
    add(context, address) {
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
    address: (state) => (address) => {
      return state.list.find((p) => p.address === address);
    },
    error: (state) => (address) => {
      return state.errors.find((e) => e.address === address);
    },
    price: (state) => (address) => {
      return state.list.find((p) => p.address === address);
    },
    convert: (state, getters) => (amount, address) => {
      const p = getters.address(address);
      if (!p) return 0;
      let priceOnly = false;
      if (!amount) {
        amount = 1;
        priceOnly = true;
      }
      let amt;
      try {
        amt = new TokenAmount(p.token, amount * Math.pow(10, p.token.decimals));
      } catch (e) {
        console.error(`Error setting token amount for ${address}`, e);
        priceOnly = true;
        amt = new TokenAmount(p.token, 1 * Math.pow(10, p.token.decimals));
      }
      const trade = new Trade(
        new Route([p.pair], p.token),
        amt,
        TradeType.EXACT_INPUT
      );

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