<template>
  <div class="w-full md:w-4/5 p-2">
    <div class="w-full flex p-2">
      <input
        type="text"
        class="p-2 text-lg border bg-gray-light border-gray rounded-sm flex-1 dark:bg-gray-darkest dark:border-gray-darkest"
        v-model="address"
        placeholder="Token address"
      />
      <button
        class="disabled:opacity-50 disabled:cursor-auto bg-gray-light rounded-md p-2 mx-2 ext-xl text-black font-bold"
        @click="add"
      >
        Add
      </button>
    </div>
    <div class="p-2 text-lg flex items-center justify-center">
      <img src="@/assets/tokens/bnb-logo.png" class="w-6 h-6 inline mr-2" />
      {{ currency(bnb, 2) }}€
    </div>
    <TokenPrice v-for="token in tokens" :key="token.name" :token="token" />
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
    const { currency } = useFormats(store);
    const store = useStore();
    const address = ref("");
    function update() {
      store.dispatch("prices/get");
    }
    update();
    setInterval(update, 5000);

    const tokens = computed(() => store.state.prices.list);
    const bnb = computed(() => store.state.prices.bnb);

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
      currency,
      bnb,
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
