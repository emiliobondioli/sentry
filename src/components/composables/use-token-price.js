import { ref } from "vue";

import { computed } from "vue";

export default function useTokenPrice({ props, store }) {
  const price = computed(() => {
    const token = store.getters["prices/address"](props.token.address);
    return token ? token.price : 0;
  });

  const amount = ref(props.token.amount);
  const conversion = computed(() => {
    return store.getters["prices/convert"](amount.value, props.token.address);
  });
  return {price, amount, conversion};
}
