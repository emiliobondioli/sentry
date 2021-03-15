<template>
  <div class="w-full flex">
    <div class="relative flex-1">
      <input
        type="text"
        class="p-2 text-lg border bg-gray-light border-gray rounded-sm w-full dark:bg-gray-darkest dark:border-gray-darkest"
        v-model="address"
        placeholder="Insert your wallett address"
      />
      <button
        v-if="address !== connectedAddress"
        @click="useConnectedAddress"
        class="text-sm disabled:opacity-50 disabled:cursor-auto bg-gray-light rounded-md p-1 mr-2 ext-xl text-black font-bold absolute right-0 top-2"
      >
        {{ truncate(connectedAddress) }}
      </button>
    </div>
    <button
      @click="save"
      :disabled="disabled"
      class="disabled:opacity-50 disabled:cursor-auto bg-gray-light rounded-md p-2 mx-2 ext-xl text-black font-bold"
    >
      Watch
    </button>
  </div>
</template>

<script>
import { ref } from "vue";
import { useStore } from "vuex";
import useWallet from "@/components/composables/use-wallet";
import { truncate } from "@/utils";

export default {
  name: "UserAddressInput",
  props: {
    disabled: Boolean,
  },
  setup(props, { emit }) {
    const store = useStore();
    const wallet = useWallet();
    const connectedAddress = wallet.address;

    const address = ref(wallet.address.value);
    address.value = store.state.preferences.address || "";

    function useConnectedAddress() {
      address.value = connectedAddress.value;
      save();
    }

    function save() {
      store.dispatch("preferences/set", { address: address.value });
      emit("update");
    }

    return {
      address,
      connectedAddress,
      useConnectedAddress,
      truncate,
      save,
    };
  },
};
</script>

<style>
html,
body {
  height: 100%;
  width: 100%;
  overflow-x: hidden;
}
#app {
  overflow: auto;
}
</style>
