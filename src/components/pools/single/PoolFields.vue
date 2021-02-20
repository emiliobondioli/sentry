<template>
  <template v-if="expanded">
    <div @click="toggle" class="cursor-pointer">
      <PoolField
        label="Deposited"
        :value="pool.depositedTokens"
        :format="currency"
        :currency="pool.info.wantName"
        :conversion="(v) => fiat(convert(v))"
      />
      <PoolField
        label="Yield"
        :value="tokenYield"
        :format="currency"
        :currency="pool.info.wantName"
        :conversion="(v) => fiat(convert(v))"
      />
      <PoolField
        label="Current"
        :value="pool.currentTokens"
        :format="currency"
        :currency="pool.info.wantName"
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
      :currency="pool.info.wantName"
      :change="pool.currentTokens - pool.depositedTokens"
      :format="currency"
      :conversion="(v) => fiat(convert(v))"
      @click="toggle"
    />
  </template>
</template>

<script>
import { useStore } from "vuex";
import useFormats from "@/components/composables/use-formats.js";
import usePool from "@/components/composables/use-pool.js";
import useExpand from "@/components/composables/use-expand.js";
import PoolField from "@/components/pools/PoolField";
import PoolPreviewField from "@/components/pools/PoolPreviewField";

export default {
  name: "PoolFields",
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
    const { fiat, currency, symbol } = useFormats(store);
    const { expanded, toggle } = useExpand();

    const {
      convert,
      convertReward,
      tokenYield,
      totalRewards,
      impermanentLoss,
      totalGain,
    } = usePool(props.pool);

    return {
      currency,
      fiat,
      tokenYield,
      totalRewards,
      impermanentLoss,
      totalGain,
      convert,
      convertReward,
      expanded,
      toggle,
      symbol,
    };
  },
};
</script>