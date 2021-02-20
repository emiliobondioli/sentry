<template>
  <header class="mb-2 flex items-start">
    <h4 class="text-lg text-gray dark:text-white font-bold flex-1">
      <TokenImage :token="token" v-if="token && !loading" />
      <SmallLoader v-else class="w-4 h-4" />
      {{ pool.name }}
    </h4>
    <PoolLabel
      :text="currency(pool.info.APY_total * 100, 1) + '%'"
      label="APY"
    />
  </header>
</template>

<script>
import { currency } from "@/components/composables/use-formats";
import PoolLabel from "@/components/pools/PoolLabel.vue";
import TokenImage from "@/components/TokenImage.vue";
import SmallLoader from "@/components/SmallLoader.vue";
import { useStore } from "vuex";

import { computed } from "vue";
export default {
  name: "PoolHeader",
  components: {
    PoolLabel,
    TokenImage,
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

    const loading = computed(() => store.state.loadingTokens);
    return {
      currency,
      token,
      loading,
    };
  },
};
</script>

<style>
</style>