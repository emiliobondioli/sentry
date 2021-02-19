<template>
  <header class="mb-2">
    <h4 class="text-lg text-gray dark:text-white font-bold flex-1">
      {{ pool.name }}
    </h4>
    <PoolLabel :text="currency(pool.info.APY * 100, 0) + '%'" label="APY" />
  </header>
</template>

<script>
import { currency } from "@/components/composables/use-formats";
import PoolLabel from "@/components/pools/PoolLabel.vue";
export default {
  components: {
    PoolLabel,
  },
  props: {
    pool: {
      type: Object,
      required: true,
    },
  },
  setup() {
    return {
      currency,
    };
  },
};
</script>

<style>
</style>