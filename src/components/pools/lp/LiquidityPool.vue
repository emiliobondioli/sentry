<template>
  <div class="pool p-4 flex bg-gray-lightest dark:bg-gray-darkest" @click="toggle">
    <div class="pool-info container">
      <PoolHeader :pool="pool" />
      <LiquidityPoolFields :pool="pool" />
      <div class="flex justify-end mt-2">
        <Label
          v-if="pool.lp"
          :text="fiat(impermanentLossValue)"
          label="IL"
          class="mr-2"
          background="bg-red-light"
        />
        <Label :text="fiat(total, 2, true)" label="Total" />
      </div>
    </div>
  </div>
</template>

<script>
import { computed } from "vue";
import { useStore } from "vuex";
import useFormats from "@/components/composables/use-formats.js";
import usePool from "@/components/composables/use-pool.js";
import useLiquidityPool from "@/components/composables/use-liquidity-pool.js";
import Label from "@/components/Label";
import PoolHeader from "@/components/pools/PoolHeader";
import LiquidityPoolFields from "@/components/pools/lp/LiquidityPoolFields";

export default {
  name: "LiquidityPool",
  components: {
    Label,
    PoolHeader,
    LiquidityPoolFields,
  },
  props: {
    pool: {
      type: Object,
      required: true,
    },
  },
  setup(props) {
    const store = useStore();
    const { fiat, currency } = useFormats(store);
    const { totalGain } = usePool(props.pool);
    const { impermanentLoss, impermanentLossValue, pair } = useLiquidityPool(
      props.pool,
      store
    );

    const total = computed(() => {
      if (!totalGain.value) return 0;
      return totalGain.value - impermanentLossValue.value;
    });

    return {
      fiat,
      total,
      impermanentLoss,
      impermanentLossValue,
      pair,
      currency,
    };
  },
};
</script>