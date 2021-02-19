<template>
  <div
    class="pool p-4 flex cursor-pointer bg-gray bg-opacity-50"
    @click="toggle"
  >
    <div class="pool-info container">
      <PoolHeader :pool="pool" />
      <LiquidityPoolFields :pool="pool" />
      <div class="flex justify-end">
        <PoolLabel
          v-if="pool.lp"
          :text="fiat(impermanentLoss)"
          label="IL"
          class="mr-2 bg-red-light"
        />
        <PoolLabel
          :text="fiat(totalGain, 3, true)"
          label="Total"
          class="bg-blue-light text-white"
        />
      </div>
    </div>
  </div>
</template>

<script>
import { useStore } from "vuex";
import useFormats from "@/components/composables/use-formats.js";
import usePool from "@/components/composables/use-pool.js";
import useLiquidityPool from "@/components/composables/use-liquidity-pool.js";
import useExpand from "@/components/composables/use-expand.js";
import PoolLabel from "@/components/pools/PoolLabel";
import PoolHeader from "@/components/pools/PoolHeader";
import LiquidityPoolFields from "@/components/pools/lp/LiquidityPoolFields";

export default {
  name: "Pool",
  components: {
    PoolLabel,
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
    const { expanded, toggle } = useExpand();

    const {
      convert,
      convertReward,
      tokenYield,
      totalRewards,
      totalGain,
    } = usePool(props.pool);

    const { impermanentLoss } = useLiquidityPool(props.pool, store);

    return {
      currency,
      fiat,
      tokenYield,
      totalRewards,
      totalGain,
      convert,
      convertReward,
      expanded,
      toggle,
      impermanentLoss,
    };
  },
};
</script>