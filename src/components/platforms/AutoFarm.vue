<template>
  <div class="autofarm-dashboard">
    <h2 class="text-3xl font-bold my-2 mt-8">Autofarm</h2>
    <div class="totals flex justify-between items-center">
      <p>
        <label class="font-bold">Initial deposit: </label
        ><span class="text-green">{{ fiat(totals.deposit, 2) }}</span>
      </p>
      <p>
        <label class="font-bold">Current: </label
        ><span class="text-green">{{ fiat(totals.total, 2) }}</span>
      </p>
      <p>
        <label class="font-bold">Yield: </label
        ><span class="text-green">{{ fiat(totals.yield, 2) }}</span>
      </p>
      <p>
        <label class="font-bold">Rewards: </label
        ><span class="text-green">{{ fiat(totals.rewards, 2) }}</span>
      </p>
      <VaultLabel
        :text="fiat(totals.rewards + totals.yield, 2)"
        label="Total: "
        class="bg-blue-light text-white flex-row-reverse "
      />
    </div>
    <h3 class="text-xl mb-2 mt-4">Single Asset Vaults</h3>
    <div class="vaults grid grid-flow-col grid-cols-2 gap-1">
      <Vault :vault="vault" v-for="vault in vaults" :key="vault.id" />
    </div>
    <h3 class="text-xl mb-2 mt-4">LP Vaults</h3>
    <div class="vaults-lp grid grid-flow-col grid-cols-2 gap-1">
      <Vault :vault="vault" v-for="vault in liquidityVaults" :key="vault.id" />
    </div>
  </div>
</template>

<script>
import Vault from "@/components/Vault.vue";
import VaultLabel from "@/components/VaultLabel.vue";
import { ref } from "vue";
import { useStore } from "vuex";
import useFormats from "@/components/composables/use-formats.js";
import useVault from "@/components/composables/use-vault.js";

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

    const vaults = ref(props.data.vaults.vaults);
    const liquidityVaults = ref(props.data.LPVaults.vaults);
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

    return { vaults, liquidityVaults, fiat, currency, totals };
  },
};
</script>
