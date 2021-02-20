<template>
  <div class="autofarm-dashboard border-b border-gray pb-2">
    <h2 class="text-3xl font-bold my-2" @click="toggle">Autofarm</h2>
    <div
      class="totals flex justify-between flex-col items-start md:items-center md:flex-row"
    >
      <p class="mb-1">
        <label class="dark:text-gray-light">Initial deposit: </label
        ><span class="font-bold">{{ fiat(totals.deposit, 2) }}</span>
      </p>
      <p class="mb-1">
        <label class="dark:text-gray-light">Current: </label
        ><span class="font-bold">{{ fiat(totals.total, 2) }}</span>
      </p>
      <p class="mb-1">
        <label class="dark:text-gray-light">Yield: </label
        ><span class="font-bold">{{ fiat(totals.yield, 2) }}</span>
      </p>
      <p class="mb-1">
        <label class="dark:text-gray-light">Rewards: </label
        ><span class="font-bold">{{ fiat(totals.rewards, 2) }}</span>
      </p>
      <Label
        :text="fiat(totals.rewards + totals.yield, 2, true)"
        label="Total:"
        :reverse="true"
      />
    </div>
    <template v-if="expanded">
      <h3 class="text-xl mb-2 mt-4">Single Asset Pools</h3>
      <div class="pool grid grid-flow-row grid-cols-1 gap-1 md:grid-cols-2">
        <Pool :pool="pool" v-for="pool in pools" :key="pool.pid" />
      </div>
      <h3 class="text-xl mb-2 mt-4">LP Pools</h3>
      <div class="pool-lp grid grid-flow-row grid-cols-1 gap-1 md:grid-cols-2">
        <LiquidityPool
          :pool="pool"
          v-for="pool in liquidityPools"
          :key="pool.pid"
        />
      </div>
    </template>
    <p
      v-else
      class="text-sm text-black-light text-center text-opacity-20 cursor-pointer"
      @click="toggle"
    >
      Click to expand
    </p>
  </div>
</template>

<script>
import Pool from "@/components/pools/single/Pool.vue";
import LiquidityPool from "@/components/pools/lp/LiquidityPool.vue";
import Label from "@/components/Label.vue";
import { ref, computed } from "vue";
import { useStore } from "vuex";
import useFormats from "@/components/composables/use-formats.js";
import useExpand from "@/components/composables/use-expand.js";

export default {
  name: "Farm",
  components: {
    Pool,
    LiquidityPool,
    Label,
  },
  props: {
    farm: {
      type: Object,
      required: true,
    },
  },
  setup(props) {
    const store = useStore();
    const { fiat, currency } = useFormats(store);
    const pools = computed(() => props.farm.pools.filter((p) => !p.lp));
    const liquidityPools = computed(() => props.farm.pools.filter((p) => p.lp));

    const totalDeposit = computed(() => {
      return props.farm.pools
        .map((p) => {
          return p.depositedTokens * p.info.wantPrice;
        })
        .reduce((a, b) => a + b, 0);
    });

    const totalYield = computed(() => {
      return props.farm.pools
        .map((p) => {
          return (p.currentTokens - p.depositedTokens) * p.info.wantPrice;
        })
        .reduce((a, b) => a + b, 0);
    });

    const totalCurrent = computed(() => {
      return props.farm.pools
        .map((p) => {
          return p.currentTokens * p.info.wantPrice;
        })
        .reduce((a, b) => a + b, 0);
    });

    const totalRewards = computed(() => {
      return props.farm.pools
        .map((p) => {
          return p.pendingRewards * p.info.rewardPrice;
        })
        .reduce((a, b) => a + b, 0);
    });

    const totals = ref({
      deposit: totalDeposit,
      yield: totalYield,
      total: totalCurrent,
      rewards: totalRewards,
    });

    const { expanded, toggle } = useExpand();
    expanded.value = true;

    return {
      pools,
      liquidityPools,
      fiat,
      currency,
      totals,
      expanded,
      toggle,
    };
  },
};
</script>
