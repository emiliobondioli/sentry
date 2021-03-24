import WalletService from "@/services/common/wallet-service";

export default {
  namespaced: true,
  state: () => ({
    balances: {},
    transactions: [],
  }),
  mutations: {
    balances(state, data) {
      state.balances = data;
    },
    transactions(state, data) {
      state.transactions = data;
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
      WalletService.getUserTransactions(address, tokens).then(
        (transactions) => {
          context.commit("transactions", transactions);
        }
      );
    },
  },
  getters: {
    address: (state) => (address) => {
      return state.balances[address] || 0;
    },
  },
};
