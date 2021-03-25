<template>
  <header class="mb-2 flex items-start">
    <h4 class="text-lg text-black dark:text-white font-bold flex-1">
      <template v-if="token && !loading">
        <PairImage :token="token" v-if="token.lp" />
        <TokenImage :token="token" v-else />
      </template>
      <SmallLoader v-else-if="loading" class="w-4 h-4" />
      {{ pool.name }}
    </h4>
    <div>
      <p class="text-xs text-gray mb-1 text-right">
        From {{ firstDepositDate }}
      </p>

      <Label
        :text="toK(pool.info.APY_total * 100, 1) + '%'"
        label="APY"
        :reverse="true"
      />
    </div>
  </header>
</template>

<script>
import { toK } from "@/components/composables/use-formats";
import Label from "@/components/Label.vue";
import TokenImage from "@/components/TokenImage.vue";
import PairImage from "@/components/PairImage.vue";
import SmallLoader from "@/components/SmallLoader.vue";
import { useStore } from "vuex";

import { computed } from "vue";
export default {
  name: "PoolHeader",
  components: {
    Label,
    TokenImage,
    PairImage,
    SmallLoader,
  },
  props: {
    pool: {
      type: Object,
      required: true,
    },
  },
  setup(props) {
    const store = useStore();
    const token = computed(() => {
      if (props.pool.lp) return store.getters.pair(props.pool.wantAddress);
      else return store.getters.token(props.pool.wantAddress);
    });

    const firstDepositDate = new Date(
      props.pool.transactions[0].date
    ).toLocaleDateString();

    const loading = computed(() => store.state.loadingTokens);
    return {
      toK,
      token,
      loading,
      firstDepositDate,
    };
  },
};
</script>

<style>
</style>