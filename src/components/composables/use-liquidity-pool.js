import { computed } from "vue";

export default function useLiquidityPool(pool, store) {
  const pair = computed(() => store.getters.pair(pool.wantAddress));
  const impermanentLoss = computed(() => {
    return 0;
  });

  const feesGain = computed(() => {
    return 0;
  });

  return {
    impermanentLoss,
    feesGain,
    pair,
  };
}
