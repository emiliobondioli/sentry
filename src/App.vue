<template>
  <main :class="{ dark, 'bg-white': !dark, 'bg-black': dark }">
    <div
      class="container p-2 md:p-4 py-8 bg-white dark:bg-black text-gray-darkest dark:text-white flex items-center flex-col lg:max-w-screen-lg md:max-w-none md:w-full mx-auto min-h-screen"
    >
      <header class="flex justify-between w-full md:w-4/5 items-center mb-8">
        <h1
          class="text-center text-2xl font-bold flex items-center justify-center"
        >
          <img
            src="@/assets/logo.svg"
            svg-inline
            class="w-12 h-12 mr-2"
          />sentry.farm
        </h1>
        <nav>
          <router-link to="/">Home</router-link> |
          <router-link to="/prices">Prices</router-link>
        </nav>
        <div>
          <button
            @click="connect"
            class="disabled:opacity-50 disabled:cursor-auto bg-gray-light rounded-md p-2 mx-2 ext-xl text-black font-bold"
            v-if="!address"
          >
            Connect
          </button>
          <span class="text-sm" v-else>{{ address }}</span>
        </div>
        <dark-mode-switch />
      </header>
      <router-view />
    </div>
  </main>
</template>

<script>
import { defineComponent } from "vue";
import { useStore } from "vuex";
import useWallet from "@/components/composables/use-wallet";
import { computed } from "vue";
import { setProvider } from "@/services/common/web3";
import Web3Modal from "web3modal";
import { truncate } from "@/utils";

import DarkModeSwitch from "@/components/DarkModeSwitch.vue";

export default defineComponent({
  components: { DarkModeSwitch },
  setup() {
    const store = useStore();
    const address = computed(() => store.state.preferences.address);
    const wallet = useWallet();
    const connectedAddress = wallet.address;
    const dark = computed(() => store.state.preferences.darkMode);
    store.dispatch("preferences/load");

    async function connect() {
      const web3Modal = new Web3Modal({
        cacheProvider: true,
      });
      const provider = await web3Modal.connect();
      setProvider(provider);
      store.dispatch("preferences/set", { address: connectedAddress.value });
    }

    return {
      dark,
      connect,
      address: truncate(address.value),
    };
  },
});
</script>
