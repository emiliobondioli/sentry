<template>
  <div
    class="container p-4 py-8 bg-white dark:bg-black text-gray dark:text-white flex items-center flex-col max-w-screen-lg mx-auto min-h-screen"
  >
    <h1
      class="mb-8 text-center text-2xl font-bold flex flex-col items-center justify-center"
    >
      <img
        src="@/assets/logo.svg"
        svg-inline
        class="w-16 h-16 mr-2"
      />watchtower
    </h1>
    <h4 class="text-center font-bold">Currency</h4>
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
    <div class="relative w-4/5">
      <div
        class="w-full h-full absolute inset-0 bg-black bg-opacity-50 flex justify-center items-center"
        v-if="loading"
      >
        <Loader class="mt-8" />
      </div>
      <Dashboard v-if="platforms" />
    </div>
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
    const address = ref("");
    const loading = ref(false);
    const platforms = computed(() => store.state.platforms);
    const { currencies, currentFiat, setFiat } = useFormats(store);

    store.dispatch("loadPreferences", address.value);
    address.value = store.state.preferences.address || "";
    if (address.value) store.dispatch("loadHistory", address.value);
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
      platforms,
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
