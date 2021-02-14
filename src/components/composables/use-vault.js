import { computed } from "vue";

export default function useVault(vault) {
  const LPInfo = computed(() => vault.LPInfo);
  const isLPVault = computed(() => !!LPInfo.value);

  const tokenYield = computed(
    () => vault.currentTokens - vault.depositedTokens
  );

  const totalRewards = computed(
    () => vault.harvestedRewards + vault.pendingRewards
  );

  const convert = (v) => v * vault.priceInUSDDepositToken;
  const convertReward = (v) => v * vault.priceInUSDRewardToken;

  const symbols = {
    token: vault.depositToken,
  };

  if (LPInfo.value) {
    (symbols.symbolToken0 = LPInfo.value.symbolToken0),
      (symbols.symbolToken1 = LPInfo.value.symbolToken1);
  }

  function getLPDepositedAmounts() {
    if (!LPInfo.value) return {};
    return {
      token0: LPInfo.value.depositToken0,
      token1: LPInfo.value.depositToken1,
      ...symbols,
    };
  }

  function getLPCurrentAmounts() {
    if (!LPInfo.value) return {};
    return {
      token0: LPInfo.value.currentToken0,
      token1: LPInfo.value.currentToken1,
      ...symbols,
    };
  }

  function getLPYieldAmounts() {
    if (!LPInfo.value) return {};
    return {
      token0: LPInfo.value.currentToken0 - LPInfo.value.depositToken0,
      token1: LPInfo.value.currentToken1 - LPInfo.value.depositToken1,
      ...symbols,
    };
  }

  const impermanentLoss = computed(() => {
    if (!LPInfo.value) return 0;
    return LPInfo.value.ILInToken1 * LPInfo.value.priceInUSDToken1;
  });

  const feesGain = computed(() => {
    if (!isLPVault.value) return 0;
    const fees0 =
      LPInfo.value.feesEarnedInToken0 * LPInfo.value.priceInUSDToken0;
    return fees0;
  });

  const tokenGain = computed(() => convert(tokenYield.value));

  const totalGain = computed(() => {
    let gain = tokenGain.value;
    if (totalRewards.value > 0) gain += convertReward(totalRewards.value);
    if (isLPVault.value) {
      gain += feesGain.value;
      gain += impermanentLoss.value;
    }
    return gain;
  });

  return {
    convert,
    convertReward,
    LPInfo,
    isLPVault,
    tokenYield,
    totalRewards,
    getLPDepositedAmounts,
    getLPCurrentAmounts,
    getLPYieldAmounts,
    impermanentLoss,
    feesGain,
    tokenGain,
    totalGain,
  };
}
