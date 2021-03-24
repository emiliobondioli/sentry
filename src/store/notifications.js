export default {
  namespaced: true,
  state: () => ({
    list: [],
  }),
  mutations: {
    notifications(state, data) {
      state.list = data;
    },
    notification(state, data) {
      state.list = [...state.list, data];
      if (state.list.length > 50)
        state.list = state.list.slice(-49);
    },
  },
  actions: {
    create(context, data) {
      const notification = {
        ...data,
        date: new Date(),
      };
      context.commit('notification', notification)
    },
  },
  getters: {
    notification: (state) => (address) => {
      return state.balances[address] || 0;
    },
  },
};
