<template>
  <div class="autofarm-dashboard border-b border-gray pb-2">
    <h2 class="text-3xl font-bold my-2" @click="toggle">Autofarm</h2>
    <div
      class="totals flex justify-between flex-col items-start md:items-center md:flex-row"
    >
      <p class="mb-1">
        <label class="font-bold">Initial deposit: </label
        ><span class="text-green">{{ fiat(totals.deposit, 2) }}</span>
      </p>
      <p class="mb-1">
        <label class="font-bold">Current: </label
        ><span class="text-green">{{ fiat(totals.total, 2) }}</span>
      </p>
      <p class="mb-1">
        <label class="font-bold">Yield: </label
        ><span class="text-green">{{ fiat(totals.yield, 2) }}</span>
      </p>
      <p class="mb-1">
        <label class="font-bold">Rewards: </label
        ><span class="text-green">{{ fiat(totals.rewards, 2) }}</span>
      </p>
      <PoolLabel
        :text="fiat(totals.rewards + totals.yield, 2)"
        label="Total: "
        class="bg-blue-light text-white flex-row-reverse"
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
      class="text-sm text-gray-light text-center text-opacity-20 cursor-pointer"
      @click="toggle"
    >
      Click to expand
    </p>
  </div>
</template>

<script>
import Pool from "@/components/pools/single/Pool.vue";
import LiquidityPool from "@/components/pools/lp/LiquidityPool.vue";
import PoolLabel from "@/components/pools/PoolLabel.vue";
import { ref, computed } from "vue";
import { useStore } from "vuex";
import useFormats from "@/components/composables/use-formats.js";
import useExpand from "@/components/composables/use-expand.js";

export default {
  name: "Farm",
  components: {
    Pool,
    LiquidityPool,
    PoolLabel,
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
    console.log(props.farm.pools);
    const pools = computed(() => props.farm.pools.filter((p) => !p.lp));
    const liquidityPools = computed(() => props.farm.pools.filter((p) => p.lp));

    const totals = ref({
      deposit: 0,
      yield: 0,
      total: 0,
      rewards: 0,
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
