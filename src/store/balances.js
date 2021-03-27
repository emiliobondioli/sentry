import WalletService from "@/services/common/wallet-service";
import Web3 from "web3";
import { TokenAmount, ChainId, WETH, Fraction } from "@pancakeswap-libs/sdk";
import { percentageChangeBN, percentageChange } from "@/utils";

export default {
  namespaced: true,
  state: () => ({
    balances: {},
    tokens: [],
  }),
  mutations: {
    balances(state, data) {
      state.balances = data;
    },
    tokens(state, data) {
      state.tokens = data;
    },
  },
  actions: {
    async get(context, { address, tokens }) {
      WalletService.getTokenBalances(address, tokens).then((r) => {
        context.commit("balances", r);
        context.dispatch("getTransactions", { address, tokens });
      });
    },
    async getTransactions(context, { address, tokens }) {
      WalletService.getUserSwaps(address, tokens).then((tokens) => {
        context.commit("tokens", tokens);
      });
    },
  },
  getters: {
    address: (state) => (address) => {
      return state.balances[address] || 0;
    },
    token: (state) => (address) => {
      return state.tokens.find((s) => s.address === address);
    },
    tokenAveragePrice: (state, getters) => (address) => {
      const token = getters.token(address);
      if (!token || !getters.address(address)) return 0;
      const swapPrices = token.swaps.map((s) => {
        const amt = parseInt(s.returnValues.amount0Out)
          ? s.returnValues.amount1In
          : s.returnValues.amount0In;
        const bnbAmount = new TokenAmount(WETH[ChainId.MAINNET], amt);
        const transaction = token.transactions.find(
          (t) => t.hash === s.transactionHash
        );
        const tokenAmount = new TokenAmount(token.token, transaction.value);
        const price = bnbAmount.divide(tokenAmount);

        const weight = price.multiply(tokenAmount);
        return { weight, amount: tokenAmount };
      });

      const weightedTotals = swapPrices.reduce((a, b) => {
        return {
          weight: a.weight.add(b.weight),
          amount: a.amount.add(b.amount),
        };
      });
      return weightedTotals.weight.divide(weightedTotals.amount).toFixed(18);
    },
    tokenPercentageChange: (state, getters) => (address, current) => {
      const price = getters.tokenAveragePrice(address);
      if (!price) return 0;
      return percentageChange(price, current);
    },
  },
};
