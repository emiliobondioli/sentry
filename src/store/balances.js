import WalletService from "@/services/common/wallet-service";
import { TokenAmount, ChainId, WETH } from "@pancakeswap-libs/sdk";
import { percentageChange } from "@/utils";

export default {
  namespaced: true,
  state: () => ({
    balances: {},
    tokens: [],
    transactions: [],
  }),
  mutations: {
    balances(state, data) {
      state.balances = data;
    },
    tokens(state, data) {
      state.tokens = data;
    },
    transactions(state, data) {
      state.transactions = data;
    },
  },
  actions: {
    async get(context, { address, tokens }) {
      await context.dispatch("getTransactions", address);
      WalletService.getTokenBalances(address, tokens).then((r) => {
        context.commit("balances", r);
        context.dispatch("getSwaps", { address, tokens });
      });
    },
    async getSwaps(context, { address, tokens }) {
      WalletService.getUserSwaps({
        address,
        tokens,
        transactions: context.state.transactions,
      }).then((tokens) => {
        context.commit("tokens", tokens);
      });
    },
    async getTransactions(context, address) {
      WalletService.getTransactions(address).then((transactions) => {
        context.commit("transactions", transactions);
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
    tokensFromTransactions: (state) => {
      const tokens = state.transactions.map((t) => ({
        address: t.contractAddress,
        symbol: t.tokenSymbol,
      }));
      return tokens.filter(
        (tk, i) => tokens.findIndex((t) => t.address === tk.address) === i
      );
    },
    tokenAveragePrice: (state, getters) => (address) => {
      const token = getters.token(address);
      if (!token) return 0;
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
