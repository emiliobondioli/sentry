<template>
  <div class="token-price-preview flex-1 w-full">
    <div
      class="flex flex-row justify-between md:justify-end text-sm md:items-center"
    >
      <div class="text-right mr-2 md:w-2/6">
        {{ currency(amount, 2) }}
      </div>
      <div
        class="text-right mr-2 md:w-2/6"
        :class="change >= 0 ? 'text-green' : 'text-red'"
      >
        <template v-if="change">{{ sign(change, 1) }}%</template>
        <span v-else class="text-white">-</span>
      </div>
      <div class="text-right mr-2 md:w-2/6">
        {{ currency(conversion.bnb, 4) }}
        <img
          src="@/assets/tokens/bnb-logo.png"
          class="w-3 h-3 md:w-4 md:h-4 inline ml-0.5 align-baseline"
        />
      </div>
      <div class="text-right mr-2 md:w-1/6">
        {{ fiat(conversion.fiat, 2) }}
      </div>
      <BlockChart
        :data="graphData"
        class="h-8 w-36 bg-black mr-2 hidden md:flex"
      />
    </div>
  </div>
</template>

<script>
import { useStore } from "vuex";
import { computed, ref } from "vue";
import useFormats from "@/components/composables/use-formats";
import BlockChart from "./BlockChart.vue";

export default {
  components: { BlockChart },
  name: "TokenPricePreview",
  props: {
    data: {
      type: Object,
      required: true,
    },
    token: {
      type: Object,
      required: true,
    },
  },
  setup(props) {
    const store = useStore();
    const { currency, fiat, sign } = useFormats(store);

    const sample = ref(15);
    const range = computed(() => props.data.history.value.slice(-sample.value));
    const graphData = computed(() => {
      if (!props.data.candle.value) return [];
      return [...range.value, props.data.candle.value];
    });

    const averagePrice = computed(() =>
      store.getters["balances/tokenAveragePrice"](props.token.address)
    );

    const change = computed(() => {
      const change = store.getters["balances/tokenPercentageChange"](
        props.token.address,
        props.data.conversion.value.priceBN
      );
      return change || 0;
    });

    const conversion = computed(() => props.data.conversion.value);
    const amount = computed(() => props.data.amount.value);

    return {
      graphData,
      currency,
      conversion,
      amount,
      fiat,
      averagePrice,
      change,
      sign,
    };
  },
};
</script>

<style>
.token-symbol {
  margin-right: 0.5rem;
}
</style>
