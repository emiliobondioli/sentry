<template>
  <div
    class="container p-4 py-8 bg-white dark:bg-gray text-gray dark:text-white flex items-center flex-col max-w-screen-lg mx-auto min-h-screen	"
  >
    <h1 class="mb-16 text-center">
      <img src="@/assets/logo.svg" svg-inline />
    </h1>
    <ul class="w-64 flex justify-between mb-8">
      <li
        v-for="(currency, name) in currencies"
        :key="name"
        class="cursor-pointer"
        :class="{ 'text-green-light font-bold': name === currentFiat }"
        @click="setFiat(name)"
      >
        {{ name }}
      </li>
    </ul>
    <div class="address w-3/5 flex">
      <input
        type="text"
        class="p-2 text-lg border border-green rounded-sm flex-1 dark:bg-gray"
        v-model="address"
        placeholder="Insert your wallett address"
      />
      <button
        @click="watch"
        :disabled="loading"
        class="disabled:opacity-50 disabled:cursor-auto bg-green-light rounded-md p-2 mx-2 ext-xl text-gray font-bold"
      >
        Watch
      </button>
    </div>
    <Loader v-if="loading" class="mt-8" />
    <Dashboard :data="data" v-else-if="data" />
  </div>
</template>

<script>
import Dashboard from "./components/Dashboard.vue";
import { ref, computed } from "vue";
import { useStore } from "vuex";
import useFormats from "./components/composables/use-formats";
import Loader from "@/components/Loader.vue";

export default {
  name: "App",
  components: {
    Dashboard,
    Loader,
  },
  setup() {
    const store = useStore();
    const address = ref("0x5132D6bbf7b868013e496D9D4Dc5F0Ec8aF8dcc6");
    const loading = ref(false);
    const data = computed(() => store.state.platforms);
    const { currencies, currentFiat, setFiat } = useFormats(store);

    if (address.value) store.dispatch("load", address.value);
    function watch() {
      if (address.value) {
        loading.value = true;
        store.dispatch("get", address.value).then(() => {
          loading.value = false;
        });
      }
    }

    return {
      address,
      data,
      watch,
      loading,
      currencies,
      currentFiat,
      setFiat,
    };
  },
};
</script>

<style>
html,
body {
  height: 100%;
}
</style>
