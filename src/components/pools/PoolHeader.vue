<template>
  <header class="mb-2 flex items-start">
    <h4 class="text-lg text-black dark:text-white font-bold flex-1">
      <TokenImage :token="token" v-if="token && !loading" />
      <SmallLoader v-else-if="loading" class="w-4 h-4" />
      {{ pool.name }}
    </h4>
    <Label
      :text="toK(pool.info.APY_total * 100, 1) + '%'"
      label="APY"
      :reverse="true"
    />
  </header>
</template>

<script>
import { toK } from "@/components/composables/use-formats";
import Label from "@/components/Label.vue";
import TokenImage from "@/components/TokenImage.vue";
import SmallLoader from "@/components/SmallLoader.vue";
import { useStore } from "vuex";

import { computed } from "vue";
export default {
  name: "PoolHeader",
  components: {
    Label,
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
      toK,
      token,
      loading,
    };
  },
};
</script>

<style>
</style>