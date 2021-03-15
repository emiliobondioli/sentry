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
import web3 from '@/services/common/web3'

const provider = getDefaultProvider("https://bsc-dataseed1.binance.org/");

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
    list: [],
    pairs: [],
    bnb: 220,
    history: {}
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
      const prices = tokens.map(async (t) => {
        const token = await Fetcher.fetchTokenData(
          ChainId.MAINNET,
          t.address,
          provider
        );
        const pair = await Fetcher.fetchPairData(
          WETH[ChainId.MAINNET],
          token,
          provider
        );
        return { ...t, pair, token };
      });

      Promise.all(prices).then((prices) => {
        context.commit("list", prices);
        context.dispatch(
          "balances/get",
          { address:  web3.givenProvider.selectedAddress, tokens: prices },
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
        bnb: trade.outputAmount.toSignificant(5),
        eur: trade.outputAmount.multiply(parseInt(state.bnb)).toSignificant(5),
        price: trade.executionPrice.toSignificant(5)
      };
    },
  },
};
