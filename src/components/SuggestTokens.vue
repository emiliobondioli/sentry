<template>
  <div class="w-full">
    <h4 class="text-md mb-2">Tokens from transactions</h4>
    <div
      v-for="token in suggested"
      :key="token.address"
      @click="add(token)"
      class="inline-block text-sm cursor-pointer mr-2 mb-1 bg-gray-light rounded-md p-1 text-black font-bold"
    >
      {{ token.symbol }}
    </div>
  </div>
</template>

<script>
import { ref, computed, watch } from "vue";
import { useStore } from "vuex";
import { isSameAddress } from "@/utils";


export default {
  name: "SuggestTokens",
  setup() {
    const store = useStore();

    const show = ref(false);

    const watchedTokens = computed(() => store.state.preferences.watchedTokens);
    const address = computed(() => store.state.preferences.address);
    watch(address, () =>
      store.dispatch("balances/getTransactions", address.value)
    );
    const tokensFromTransactions = computed(
      () => store.getters["balances/tokensFromTransactions"]
    );

    const suggested = computed(() => {
      return tokensFromTransactions.value.filter(
        (t) => !watchedTokens.value.some((wt) => isSameAddress(wt.address, t.address)) && t.symbol !== 'Cake-LP'
      );
    });

    function add(token) {
      store.dispatch("prices/add", token);
    }

    return {
      tokensFromTransactions,
      suggested,
      add,
      show,
    };
  },
};
</script>
