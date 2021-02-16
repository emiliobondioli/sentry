<template>
  <div class="autofarm-dashboard border-b border-gray pb-2">
    <h2 class="text-3xl font-bold my-2" @click="toggle">Autofarm</h2>
    <div
      @click="toggle"
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
      <VaultLabel
        :text="fiat(totals.rewards + totals.yield, 2)"
        label="Total: "
        class="bg-blue-light text-white flex-row-reverse"
      />
    </div>
    <template v-if="expanded">
      <h3 class="text-xl mb-2 mt-4">Single Asset Vaults</h3>
      <div class="vaults grid grid-flow-row grid-cols-1 gap-1 md:grid-cols-2">
        <Vault :vault="vault" v-for="vault in vaults" :key="vault.id" />
      </div>
      <h3 class="text-xl mb-2 mt-4">LP Vaults</h3>
      <div
        class="vaults-lp grid grid-flow-row grid-cols-1 gap-1 md:grid-cols-2"
      >
        <Vault
          :vault="vault"
          v-for="vault in liquidityVaults"
          :key="vault.id"
        />
      </div>
    </template>
    <p v-else class="text-sm text-gray-light text-center text-opacity-20">
      Click to expand
    </p>
  </div>
</template>

<script>
import Vault from "@/components/Vault.vue";
import VaultLabel from "@/components/VaultLabel.vue";
import { ref } from "vue";
import { useStore } from "vuex";
import useFormats from "@/components/composables/use-formats.js";
import useVault from "@/components/composables/use-vault.js";
import useExpand from "@/components/composables/use-expand.js";

export default {
  name: "AutoFarm",
  components: {
    Vault,
    VaultLabel,
  },
  props: {
    data: {
      type: Object,
      required: true,
    },
  },
  setup(props) {
    const store = useStore();
    const { fiat, currency } = useFormats(store);

    const vaults = ref(props.data.vaults.vaults.filter(v=>v.depositedTokens));
    const liquidityVaults = ref(props.data.LPVaults.vaults.filter(v=>v.depositedTokens));
    const totals = ref({
      deposit:
        props.data.vaults.totalUSDValues.deposit +
        props.data.LPVaults.totalUSDValues.deposit,
      yield:
        props.data.vaults.totalUSDValues.yield +
        props.data.LPVaults.totalUSDValues.yield,
      total:
        props.data.vaults.totalUSDValues.total +
        props.data.LPVaults.totalUSDValues.total,
      rewards: calculateTotalRewards(
        props.data.vaults.vaults.concat(props.data.LPVaults.vaults)
      ),
    });

    function calculateTotalRewards(vaults) {
      return vaults
        .map((v) => {
          const { totalRewards, convertReward } = useVault(v);
          return convertReward(totalRewards.value);
        })
        .reduce((a, b) => a + b);
    }

    const { expanded, toggle } = useExpand();
    expanded.value = true;

    return {
      vaults,
      liquidityVaults,
      fiat,
      currency,
      totals,
      expanded,
      toggle,
    };
  },
};
</script>
