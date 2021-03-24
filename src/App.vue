<template>
  <main :class="{ dark, 'bg-white': !dark, 'bg-black': dark }">
    <div
      class="container p-2 md:p-4 py-8 bg-white dark:bg-black text-gray-darkest dark:text-white flex items-center flex-col lg:max-w-screen-lg md:max-w-none md:w-full mx-auto min-h-screen"
    >
      <header
        class="flex w-full md:w-4/5 md:items-center mb-4 md:mb-6 flex-col md:flex-row justify-between"
      >
        <h1
          class="text-center text-xl md:text-2xl font-bold flex items-center justify-center"
        >
          <img
            src="@/assets/logo.svg"
            svg-inline
            class="w-10 h-10 md:w-12 md:h-12 mr-2"
          />defi<span class="text-gray">.</span>sentinel
        </h1>
        <nav class="hidden md:block">
          <router-link to="/">Farms</router-link> |
          <router-link to="/prices">Prices</router-link>
        </nav>
        <div class="flex justify-between items-center mt-2 md:mt-0">
          <button
            @click="connect"
            class="disabled:opacity-50 disabled:cursor-auto bg-gray-light rounded-md p-2 mx-2 ext-xl text-black font-bold"
            v-if="!address"
          >
            Connect
          </button>
          <div class="flex bg-black-dark p-1 rounded-sm items-center mr-2" v-else>
            <span class="text-sm">
              {{ shortAddress }}
            </span>
            <a
              :href="bscScanLink"
              class="inline w-4 cursor-pointer mx-2 align-bottom"
              target="_blank"
            >
              <img
                src="@/assets/icons/external.svg"
                svg-inline
                class="fill-current"
              />
            </a>
            <img
              src="@/assets/icons/remove.svg"
              svg-inline
              class="fill-current inline w-4 ml-1 cursor-pointer align-bottom"
              @click="remove"
            />
          </div>
          <notification-list />
          <dark-mode-switch class="ml-2" />
        </div>
      </header>
      <nav class="md:hidden">
        <router-link to="/">Farms</router-link> |
        <router-link to="/prices">Prices</router-link>
      </nav>
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
import NotificationList from '@/components/notifications/NotificationList.vue'

export default defineComponent({
  components: { DarkModeSwitch, NotificationList },
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
      store.dispatch("preferences/set", { address: "" });
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
      shortAddress,
    };
  },
});
</script>