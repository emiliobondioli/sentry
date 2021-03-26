<template>
  <div
    class="block-chart relative flex items-end justify-end overflow-visible flex-nowrap"
    ref="container"
    @click.stop="switchConversion"
  >
    <div
      class="absolute top-0 left-0 text-xs p-1 bg-black pointer-events-none z-10 bg-opacity-80"
      v-if="tooltip"
      :style="tooltipStyle"
    >
      {{ tooltip.block[conversions[conversion]] }}
    </div>
    <div
      v-for="block in data"
      :key="block.time"
      class="history-block bg-gray w-1.5"
      :style="blockStyle(block)"
      @mouseenter="showTooltip(block, $event)"
      @mouseleave="tooltip = null"
    ></div>
    <div
      class="history-block bg-gray-light w-1.5"
      :style="currentBlockStyle"
    ></div>
  </div>
</template>

<script>
import { useStore } from "vuex";
import { computed, ref } from "vue";
import useFormats from "@/components/composables/use-formats";
import { map } from "@/utils";

export default {
  name: "TokenPrice",
  props: {
    data: {
      type: Array,
      required: true,
    },
  },
  setup(props) {
    const store = useStore();
    const { currency } = useFormats(store);

    const tooltip = ref(null);
    const container = ref(null);

    const tooltipStyle = computed(() => {
      if (!tooltip.value) return null;
      return {
        transform: `translateX(${tooltip.value.x}px)`,
      };
    });

    const conversions = ["fiat", "bnb", "close"];
    const conversion = ref(0);

    function switchConversion() {
      conversion.value++;
      if (conversion.value >= conversions.length) conversion.value = 0;
    }

    const max = computed(() => {
      const values = props.data.map((h) => h.close);
      return Math.max(...values);
    });

    const min = computed(() => {
      const values = props.data.map((h) => h.close);
      return Math.min(...values);
    });

    function height(v) {
      return map(v, min.value / 1.1, max.value * 1.1, 0, 100);
    }

    function blockStyle(block) {
      const h = height(block.close);
      return { height: h + "%" };
    }

    const currentBlockStyle = computed(() => {
      const price = props.data[props.data.length - 1];
      if (!price) return null;
      const h = height(price.close);
      return { height: h + "%" };
    });

    function showTooltip(block, event) {
      tooltip.value = {
        block,
        x: event.clientX - container.value.getBoundingClientRect().x,
      };
    }

    return {
      currency,
      blockStyle,
      currentBlockStyle,
      history,
      tooltip,
      showTooltip,
      tooltipStyle,
      container,
      conversion,
      switchConversion,
      conversions,
    };
  },
};
</script>

<style scoped>
.history-block {
  border-right: 1px solid rgb(33, 37, 41);
}
</style>
