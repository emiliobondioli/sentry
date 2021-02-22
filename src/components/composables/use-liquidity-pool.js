import { computed } from "vue";
import { percentageChange } from "@/utils";

export default function useLiquidityPool(pool, store) {
  const pair = computed(() => store.getters.pair(pool.wantAddress));

  const change = computed(() => {
    if (!pair.value || !pool.lpComputed) return 0;
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

  const depositedCurrentValue = computed(() => {
    if (!pair.value || !pool.lpComputed) return 0;
    const token0Value =
      pair.value.token0.priceUSD * pool.depositedSingleTokens.token0Amount;
    const token1Value =
      pair.value.token1.priceUSD * pool.depositedSingleTokens.token1Amount;
      console.log(token0Value, token1Value)
    return token0Value + token1Value;
  });

  const impermanentLoss = computed(() => {
    console.log(pair.value);
    if (!pair.value || !pool.lpComputed) return null;
    const token0Amount =
      (pool.depositedTokens / pair.value.totalSupply) * pair.value.reserve0;
    const token1Amount =
      (pool.depositedTokens / pair.value.totalSupply) * pair.value.reserve1;
    const token0Change = pool.depositedSingleTokens.token0Amount - token0Amount;
    const token1Change = pool.depositedSingleTokens.token1Amount - token1Amount;

    return {
      token0Amount,
      token1Amount,
      token0Change,
      token1Change,
    };
  });

  const impermanentLossValue = computed(() => {
    if (!impermanentLoss.value) return 0;
    const token0LiquidityValue =
      impermanentLoss.value.token0Amount * pair.value.token0.priceUSD;
    const token1LiquidityValue =
      impermanentLoss.value.token1Amount * pair.value.token1.priceUSD;
    console.log(token1LiquidityValue, token1LiquidityValue, depositedCurrentValue.value);
    return (
      token0LiquidityValue + token1LiquidityValue - depositedCurrentValue.value
    );
  });

  const currentValue = computed(() => {
    if (!pair.value || !pool.lpComputed) return 0;
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
