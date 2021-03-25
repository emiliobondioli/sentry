<template>
  <div class="w-full md:w-4/5 p-2 flex flex-col items-center">
    <div class="w-full flex md:w-4/5">
      <input
        type="text"
        class="p-2 text-lg border bg-gray-light border-gray rounded-sm flex-1 dark:bg-gray-darkest dark:border-gray-darkest"
        v-model="address"
        placeholder="Token address"
        @keydown.enter="add"
      />
      <button
        class="disabled:opacity-50 disabled:cursor-auto bg-gray-light rounded-md p-2 ml-2 ext-xl text-black font-bold"
        @click="add"
      >
        Add
      </button>
    </div>
    <div class="p-2 mt-2 text-lg flex items-center">
      <div>
        <select
          v-model="currentFiat"
          @change="updateFiat"
          class="bg-black-dark mr-4 text-sm p-1"
        >
          <option value="EUR">EUR</option>
          <option value="USD">USD</option>
        </select>
      </div>
      <img src="@/assets/tokens/bnb-logo.png" class="w-6 h-6 inline mr-2" />
      {{ fiat(bnb, 2) }}
    </div>
    <TokenPrice v-for="token in tokens" :key="token.address" :token="token" />
  </div>
</template>

<script>
import { ref, computed } from "vue";
import { useStore } from "vuex";
import TokenPrice from "@/components/prices/TokenPrice";
import useFormats from "@/components/composables/use-formats";

export default {
  name: "Prices",
  components: { TokenPrice },
  setup() {
    const store = useStore();
    const { fiat } = useFormats(store);
    const address = ref("");
    function update() {
      store.dispatch("prices/get");
    }
    update();
    setInterval(update, 5000);

    const tokens = computed(() => store.state.preferences.watchedTokens);
    const bnb = computed(() => store.state.prices.bnb);

    const currentFiat = ref(store.getters["preferences/fiat"]);

    function updateFiat() {
      store.dispatch("preferences/set", { fiat: currentFiat.value });
      update();
    }

    function add() {
      store.dispatch("prices/add", address.value).then(() => {
        address.value = "";
      });
    }

    function convert(token) {
      return token.price * token.amount;
    }

    return {
      add,
      address,
      tokens,
      convert,
      fiat,
      bnb,
      updateFiat,
      currentFiat,
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
