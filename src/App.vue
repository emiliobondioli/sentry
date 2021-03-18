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
          <span class="text-sm" v-else>
            {{ shortAddress }}
            <img
              src="@/assets/icons/remove.svg"
              svg-inline
              class="fill-current inline w-4 cursor-pointer mx-1 align-bottom"
              @click="remove"
            />
            <a :href="bscScanLink" target="_blank">
              <img
                src="@/assets/icons/external.svg"
                svg-inline
                class="fill-current inline w-4 cursor-pointer mx-1 align-bottom"
              />
            </a>
          </span>
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
import { computed } from "vue";
import Web3Modal from "web3modal";
import { truncate } from "@/utils";

import DarkModeSwitch from "@/components/DarkModeSwitch.vue";

export default defineComponent({
  components: { DarkModeSwitch },
  setup() {
    const store = useStore();
    const address = computed(() => store.state.preferences.address);
    const shortAddress = computed(() => truncate(address.value));
    const dark = computed(() => store.state.preferences.darkMode);
    store.dispatch("preferences/load");

    async function connect() {
      const web3Modal = new Web3Modal({
        cacheProvider: false,
      });
      const provider = await web3Modal.connect();
      store.dispatch("preferences/set", { address: provider.selectedAddress });
    }

    function remove() {
      store.dispatch("preferences/set", { address: '' });
    }

    const bscScanLink = computed(
      () => `https://bscscan.com/address/${address.value}`
    );

    return {
      dark,
      connect,
      remove,
      bscScanLink,
      address,
      shortAddress
    };
  },
});
</script>
