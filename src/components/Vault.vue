<template>
  <div
    class="vault p-4 flex border-b border-green-light w-1/2 cursor-pointer"
    @click="toggle"
  >
    <div class="vault-icon"></div>
    <div class="vault-info container">
      <div class="vault-name flex mb-2">
        <h4 class="text-lg text-gray dark:text-white font-bold flex-1">
          {{ vault.name }}
        </h4>
        <VaultLabel :text="currency(vault.apy * 100, 0) + '%'" label="APY" />
      </div>
      <template v-if="expanded">
        <VaultField
          label="Deposited"
          :info="isLPVault ? lpTokensDeposited : null"
          :value="vault.depositedTokens"
          :format="currency"
          :currency="!isLPVault ? vault.depositToken : 'LP'"
          :conversion="(v) => fiat(convert(v))"
        />
        <VaultField
          label="Yield"
          :info="isLPVault ? lpTokensYield : null"
          :value="tokenYield"
          :format="currency"
          :currency="!isLPVault ? vault.depositToken : 'LP'"
          :conversion="(v) => fiat(convert(v))"
        />
        <VaultField
          label="Current"
          :info="isLPVault ? lpTokensCurrent : null"
          :value="vault.currentTokens"
          :format="currency"
          :currency="!isLPVault ? vault.depositToken : 'LP'"
          :conversion="(v) => fiat(convert(v))"
        />
        <VaultField
          v-if="totalRewards"
          label="Pending harvest"
          :value="vault.pendingRewards"
          :format="currency"
          :currency="vault.rewardToken"
          :conversion="(v) => fiat(convertReward(v))"
        />
        <VaultField
          v-if="totalRewards"
          label="Total rewards"
          :value="vault.harvestedRewards + vault.pendingRewards"
          :format="currency"
          :currency="vault.rewardToken"
          :conversion="(v) => fiat(convertReward(v))"
        />
      </template>
      <template v-else>
        <VaultFieldLite
          :info="lpTokensCurrent"
          :value="vault.currentTokens"
          :currency="!isLPVault ? vault.depositToken : 'LP'"
          :change="vault.currentTokens - vault.depositedTokens"
          :format="currency"
          :conversion="(v) => fiat(convert(v))"
        />
      </template>
      <div class="flex justify-end">
        <VaultLabel
          v-if="isLPVault"
          :text="fiat(impermanentLoss)"
          label="IL"
          class="mr-2 bg-red-light"
        />
        <VaultLabel
          :text="fiat(totalGain, 3, true)"
          label="Total"
          class="bg-blue-light text-white"
        />
      </div>
    </div>
  </div>
</template>

<script>
import { computed } from "vue";
import { useStore } from "vuex";
import useFormats from "@/components/composables/use-formats.js";
import useVault from "@/components/composables/use-vault.js";
import useExpand from "@/components/composables/use-expand.js";
import VaultField from "./VaultField";
import VaultFieldLite from "./VaultFieldLite";
import VaultLabel from "./VaultLabel";

export default {
  name: "Vault",
  components: {
    VaultField,
    VaultLabel,
    VaultFieldLite,
  },
  props: {
    vault: {
      type: Object,
      required: true,
    },
  },
  setup(props) {
    const store = useStore();
    const { fiat, currency, lpPair } = useFormats(store);
    const { expanded, toggle } = useExpand();

    const {
      convert,
      convertReward,
      isLPVault,
      tokenYield,
      totalRewards,
      impermanentLoss,
      totalGain,
      getLPDepositedAmounts,
      getLPCurrentAmounts,
      getLPYieldAmounts,
    } = useVault(props.vault);

    const lpTokensDeposited = computed(() =>
      isLPVault.value ? lpPair(getLPDepositedAmounts()) : ""
    );
    const lpTokensCurrent = computed(() =>
      isLPVault.value ? lpPair(getLPCurrentAmounts()) : ""
    );
    const lpTokensYield = computed(() =>
      isLPVault.value ? lpPair(getLPYieldAmounts()) : ""
    );

    return {
      currency,
      fiat,
      isLPVault,
      tokenYield,
      totalRewards,
      lpTokensDeposited,
      lpTokensYield,
      lpTokensCurrent,
      impermanentLoss,
      totalGain,
      convert,
      convertReward,
      expanded,
      toggle,
    };
  },
};
</script>

<style scoped>
</style>
