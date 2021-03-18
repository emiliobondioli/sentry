<template>
  <div class="address w-full md:w-4/5 p-2">
    <UserAddressInput @update="scan" :disabled="loading" />
  </div>
  <template v-if="!farms.length">
    <h4 class="text-center font-bold mt-2">Platforms</h4>
    <ul class="p-2 w-full flex justify-center mb-2 md:mb-8">
      <li
        v-for="platform in platforms"
        :key="platform.id"
        class="font-bold rounded-md px-2 py-2 ext-xl cursor-pointer"
        :class="{
          'text-black bg-gray-light': selectedPlatforms.includes(platform.id),
          'text-gray bg-gray-dark': !selectedPlatforms.includes(platform.id),
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
        :class="{ 'text-gray-light font-bold': name === currentFiat }"
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
</template>

<script>
import Dashboard from "@/components/Dashboard.vue";
import { ref, computed } from "vue";
import { useStore } from "vuex";
import useFormats from "@/components/composables/use-formats";
import Loader from "@/components/Loader.vue";
import { truncate } from "@/utils";
import UserAddressInput from '@/components/UserAddressInput'

export default {
  name: "Home",
  components: {
    Dashboard,
    Loader,
    UserAddressInput
  },
  setup() {
    const store = useStore();
    const address = computed(() => store.state.preferences.address);

    const loading = ref(false);
    const selectedPlatforms = computed(() => [
      ...store.state.preferences.platforms,
    ]);
    const platforms = computed(() => store.state.platforms);
    const farms = computed(() => store.state.farms || []);
    const { currencies, currentFiat, setFiat } = useFormats(store);

    function togglePlatform(platformId) {
      const platforms = [...selectedPlatforms.value];
      const idx = platforms.indexOf(platformId);
      if (idx >= 0) platforms.splice(idx, 1);
      else platforms.push(platformId);
      store.dispatch("preferences/set", { platforms });
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
      selectedPlatforms,
      togglePlatform,
      truncate,
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
