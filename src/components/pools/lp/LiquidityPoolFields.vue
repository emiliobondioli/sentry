<template>
  <template v-if="expanded">
    <PoolField
      label="Deposited"
      :info="depositedSingleTokens"
      :value="pool.depositedTokens"
      :format="currency"
      currency="LP"
      :conversion="(v) => fiat(convert(v))"
    />
    <PoolField
      label="Yield"
      :info="yieldSingleTokens"
      :value="tokenYield"
      :format="currency"
      currency="LP"
      :conversion="(v) => fiat(convert(v))"
    />
    <PoolField
      label="Current"
      :info="currentSingleTokens"
      :value="pool.currentTokens"
      :format="currency"
      currency="LP"
      :conversion="(v) => fiat(convert(v))"
    />
    <PoolField
      v-if="totalRewards"
      label="Pending harvest"
      :value="pool.pendingRewards"
      :format="currency"
      :currency="pool.rewardToken"
      :conversion="(v) => fiat(convertReward(v))"
    />
    <PoolField
      v-if="totalRewards"
      label="Total rewards"
      :value="pool.harvestedRewards + pool.pendingRewards"
      :format="currency"
      :currency="pool.rewardToken"
      :conversion="(v) => fiat(convertReward(v))"
    />
  </template>
  <template v-else>
    <PoolPreviewField
      :value="pool.currentTokens"
      :info="currentSingleTokens"
      currency="LP"
      :change="pool.currentTokens - pool.depositedTokens"
      :format="currency"
      :conversion="(v) => fiat(convert(v))"
    />
  </template>
</template>

<script>
import { computed } from "vue";
import { useStore } from "vuex";
import useFormats from "@/components/composables/use-formats.js";
import usePool from "@/components/composables/use-pool.js";
import useLiquidityPool from "@/components/composables/use-liquidity-pool.js";
import useExpand from "@/components/composables/use-expand.js";
import PoolField from "@/components/pools/PoolField";
import PoolPreviewField from "@/components/pools/PoolPreviewField";

export default {
  name: "Pool",
  components: {
    PoolField,
    PoolPreviewField,
  },
  props: {
    pool: {
      type: Object,
      required: true,
    },
  },
  setup(props) {
    const store = useStore();
    const { fiat, currency, lpPair } = useFormats(store);
    const { expanded, toggle } = useExpand();
    const { pair } = useLiquidityPool(props.pool, store);

    const {
      convert,
      convertReward,
      tokenYield,
      totalRewards,
      totalGain,
    } = usePool(props.pool);

    const lpTokensDeposited = computed(() =>
      !pair.value
        ? null
        : lpPair({ ...pair.value, ...props.pool.depositedSingleTokens })
    );
    const lpTokensCurrent = computed(() =>
      !pair.value
        ? null
        : lpPair({ ...pair.value, ...props.pool.currentSingleTokens })
    );
    const lpTokensYield = computed(() =>
      !pair.value
        ? null
        : lpPair({ ...pair.value, ...props.pool.yieldSingleTokens })
    );

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
      lpTokensDeposited,
      lpTokensYield,
      lpTokensCurrent,
      pair,
    };
  },
};
</script>