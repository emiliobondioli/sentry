import { computed } from "vue";

export default function useVault(vault) {
  const tokenYield = computed(
    () => vault.currentTokens - vault.depositedTokens
  );

  const totalRewards = computed(() => vault.pendingRewards);

  const convert = (v) => v * vault.info.wantPrice;
  const convertReward = (v) => v * vault.info.rewardPrice;

  const tokenGain = computed(() => convert(tokenYield.value));

  return {
    convert,
    convertReward,
    tokenYield,
    totalRewards,
    tokenGain,
  };
}
