import WalletService from "@/services/common/wallet-service";

export default {
  namespaced: true,
  state: () => ({
    balances: {},
  }),
  mutations: {
    balances(state, data) {
      state.balances = data;
    },
  },
  actions: {
    async get(context, { address, tokens }) {
      WalletService.getTokenBalances(address, tokens).then((r) => {
        context.commit("balances", r);
      });
    },
  },
  getters: {
    address: state => address => {
      return state.balances[address] || 0
    }
  }
};
