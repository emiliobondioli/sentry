<template>
  <main :class="{ dark, 'bg-white': !dark, 'bg-black': dark }">
    <div
      class="container p-2 md:p-4 py-8 bg-white dark:bg-black text-gray dark:text-white flex items-center flex-col lg:max-w-screen-lg md:max-w-none md:w-full mx-auto min-h-screen"
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
        <dark-mode-switch />
      </header>
      <div class="address w-full md:w-4/5 p-2 flex">
        <input
          type="text"
          class="p-2 text-lg border border-green rounded-sm flex-1 dark:bg-gray"
          v-model="address"
          placeholder="Insert your wallett address"
        />
        <button
          @click="scan"
          :disabled="loading"
          class="disabled:opacity-50 disabled:cursor-auto bg-green-light rounded-md p-2 mx-2 ext-xl text-gray font-bold"
        >
          Watch
        </button>
      </div>
      <template v-if="!farms.length">
        <h4 class="text-center font-bold mt-2">Platforms</h4>
        <ul class="p-2 w-full flex justify-center mb-2 md:mb-8">
          <li
            v-for="platform in platforms"
            :key="platform.id"
            class="font-bold rounded-md px-2 py-2 ext-xl cursor-pointer"
            :class="{
              'text-black bg-green-light': selectedPlatforms.includes(
                platform.id
              ),
              'text-white bg-gray': !selectedPlatforms.includes(platform.id),
            }"
            @click="togglePlatform(platform.id)"
          >
            {{ platform.name }}
          </li>
        </ul>
      </template>
      <template v-else>
        <h4 class="text-center font-bold mt-2">Currency</h4>
        <ul class="p-2 w-full md:w-64 flex justify-between mb-2 md:mb-8">
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
      </template>
      <div class="relative md:w-4/5 w-full p-2 inset-0">
        <div
          class="w-full h-full absolute inset-0 bg-black bg-opacity-50 flex justify-center items-start pt-16 md:pt-0 md:items-center"
          v-if="loading"
        >
          <Loader class="mt-8" />
        </div>
        <Dashboard v-if="farms.length" />
      </div>
    </div>
  </main>
</template>

<script>
import Dashboard from "./components/Dashboard.vue";
import { ref, computed } from "vue";
import { useStore } from "vuex";
import useFormats from "./components/composables/use-formats";
import Loader from "@/components/Loader.vue";
import DarkModeSwitch from "./components/DarkModeSwitch.vue";

export default {
  name: "App",
  components: {
    Dashboard,
    Loader,
    DarkModeSwitch,
  },
  setup() {
    const store = useStore();
    const address = ref("");
    const loading = ref(false);
    const selectedPlatforms = computed(() => [
      ...store.state.preferences.platforms,
    ]);
    const platforms = computed(() => store.state.platforms);
    const farms = computed(() => store.state.farms || []);
    const dark = computed(() => store.state.preferences.darkMode);
    const { currencies, currentFiat, setFiat } = useFormats(store);

    store.dispatch("loadPreferences", address.value);
    address.value = store.state.preferences.address || "";
    if (address.value) store.dispatch("loadHistory", address.value);

    function togglePlatform(platformId) {
      const platforms = [...selectedPlatforms.value];
      const idx = platforms.indexOf(platformId);
      if (idx >= 0) platforms.splice(idx, 1);
      else platforms.push(platformId);
      store.dispatch("preferences", { platforms });
    }

    function scan() {
      if (address.value) {
        loading.value = true;
        store
          .dispatch("get", {
            address: address.value,
            platforms: selectedPlatforms.value,
          })
          .then(() => {
            loading.value = false;
          });
      }
    }

    return {
      address,
      platforms,
      farms,
      scan,
      loading,
      currencies,
      currentFiat,
      setFiat,
      dark,
      selectedPlatforms,
      togglePlatform,
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
