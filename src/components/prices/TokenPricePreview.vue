<template>
  <div class="token-price-preview flex-1">
    <div class="flex justify-end text-sm items-center">
      <div class="text-right mr-4 w-1/5">
        {{ currency(conversion.bnb, 10) }}
        <img
          src="@/assets/tokens/bnb-logo.png"
          class="w-4 h-4 inline ml-0.5 align-baseline"
        />
      </div>
      <div class="text-right mr-4 w-1/5">
        {{ fiat(conversion.fiat, 10) }}
      </div>
      <BlockChart :data="graphData" class="h-8 w-32 bg-black mr-2" />
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
  },
  setup(props) {
    const store = useStore();
    const { currency, fiat } = useFormats(store);

    const sample = ref(19);
    const range = computed(() => props.data.history.value.slice(-sample.value));
    const graphData = computed(() => {
      if (!props.data.candle.value) return [];
      return [...range.value, props.data.candle.value];
    });

    const conversion = computed(()=>props.data.conversion.value);

    return {
      graphData,
      currency,
      conversion,
      fiat
    };
  },
};
</script>

<style>
.token-symbol {
  margin-right: 0.5rem;
}
</style>
