<template>
  <template v-if="expanded">
    <div @click="toggle" class="cursor-pointer">
      <PoolField
        label="Deposited"
        :info="pairDeposited"
        :loading="loading"
        :value="pool.depositedTokens"
        :format="currency"
        currency="LP"
        :conversion="(v) => fiat(convert(v))"
      />
      <PoolField
        label="Yield"
        :info="pairYield"
        :loading="loading"
        :value="tokenYield"
        :format="currency"
        currency="LP"
        :conversion="(v) => fiat(convert(v))"
      />
      <PoolField
        label="Current"
        :info="pairCurrent"
        :loading="loading"
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
        :currency="pool.rewardSymbol"
        :conversion="(v) => fiat(convertReward(v))"
      />
    </div>
  </template>
  <template v-else>
    <PoolPreviewField
      class="cursor-pointer"
      :value="pool.currentTokens"
      :info="pairCurrent"
      :loading="loading"
      currency="LP"
      :change="pool.currentTokens - pool.depositedTokens"
      :format="currency"
      :conversion="(v) => fiat(convert(v))"
      @click="toggle"
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
  name: "LiquidityPoolFields",
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
    const loading = computed(() => store.state.loadingTokens);

    const {
      convert,
      convertReward,
      tokenYield,
      totalRewards,
      totalGain,
    } = usePool(props.pool);

    const pairDeposited = computed(() =>
      !pair.value
        ? null
        : lpPair({ ...pair.value, ...props.pool.depositedSingleTokens })
    );

    const pairYield = computed(() =>
      !pair.value
        ? null
        : lpPair({ ...pair.value, ...props.pool.yieldSingleTokens })
    );

    const pairCurrent = computed(() =>
      !pair.value
        ? null
        : lpPair({ ...pair.value, ...props.pool.currentSingleTokens })
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
      pairDeposited,
      pairYield,
      pairCurrent,
      pair,
      loading,
    };
  },
};
</script>