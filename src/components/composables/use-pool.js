import { computed } from "vue";

export default function usePool(pool) {
  const tokenYield = computed(
    () => pool.currentTokens - pool.depositedTokens
  );

  const totalRewards = computed(() => pool.pendingRewards);

  const convert = (v) => v * pool.info.wantPrice;
  const convertReward = (v) => v * pool.info.rewardPrice;

  const tokenGain = computed(() => convert(tokenYield.value));
  const totalGain = computed(() => convertReward(totalRewards.value) + tokenGain.value);

  return {
    convert,
    convertReward,
    tokenYield,
    totalRewards,
    totalGain,
    tokenGain
  };
}

