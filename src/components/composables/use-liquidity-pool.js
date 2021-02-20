import { computed } from "vue";
import { percentageChange } from "@/utils";

export default function useLiquidityPool(pool, store) {
  const pair = computed(() => store.getters.pair(pool.wantAddress));

  const change = computed(() => {
    if (!pair.value) return 0;
    return {
      token0Change:
        ((pool.depositedSingleTokens.token0Price - pair.value.token0Price) /
          pair.value.token0Price) *
        100.0,
      token1Change:
        ((pool.depositedSingleTokens.token1Price - pair.value.token1Price) /
          pair.value.token1Price) *
        100.0,
    };
  });

  const currentValue = computed(() => {
    if (!pair.value) return 0;
    const token0Value = percentageChange(
      pair.value.token0.priceUSD * pool.currentSingleTokens.token0Amount,
      change.value.token0Change
    );
    const token1Value = percentageChange(
      pair.value.token1.priceUSD * pool.currentSingleTokens.token1Amount,
      change.value.token1Change
    );
    return token0Value + token1Value;
  });

  const depositedCurrentValue = computed(() => {
    if (!pair.value) return 0;
    const token0Value =
      pair.value.token0.priceUSD * pool.depositedSingleTokens.token0Amount;
    const token1Value =
      pair.value.token1.priceUSD * pool.depositedSingleTokens.token1Amount;
    return token0Value + token1Value;
  });

  const impermanentLoss = computed(() => {
    return (
      (2 * Math.sqrt(Math.abs(change.value.token0Change))) /
        (0 + Math.abs(change.value.token1Change)) -
      1
    );
  });

  const impermanentLossValue = computed(() => {
    if (!currentValue.value) return 0;
    return (impermanentLoss.value * 100) / currentValue.value;
  });

  const feesGain = computed(() => {
    return 0;
  });

  return {
    impermanentLoss,
    feesGain,
    pair,
    depositedCurrentValue,
    impermanentLossValue,
    currentValue,
  };
}
