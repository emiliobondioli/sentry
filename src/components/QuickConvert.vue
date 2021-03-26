<template>
  <div>
    <input
      type="number"
      class="p-1 text-lg border mr-2 bg-gray-light border-gray rounded-sm w-20 dark:bg-gray-darkest dark:border-gray-darkest"
      v-model="amount"
      placeholder="BNB"
    />
    <span>{{ fiat(conversion) }}</span>
  </div>
</template>

<script>
import { ref, computed } from "vue";
import { useStore } from "vuex";
import useFormats from "@/components/composables/use-formats";

export default {
  name: "Prices",
  setup() {
    const store = useStore();
    const { fiat } = useFormats(store);
    const bnb = computed(() => store.state.prices.bnb);
    const amount = ref(0);
    const show = ref(false);

    const conversion = computed(() => amount.value * bnb.value);

    return {
      show,
      conversion,
      fiat,
      amount
    };
  },
};
</script>
