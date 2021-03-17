<template>
  <div class="block-chart flex h-16 py-1 items-end justify-end w-full">
    <div
      v-for="block in range"
      :key="block.time"
      class="history-block bg-gray w-2"
      :style="blockStyle(block)"
    ></div>
    <div
      class="history-block bg-gray-light w-2"
      :style="currentBlockStyle"
    ></div>
  </div>
</template>

<script>
import { useStore } from "vuex";
import { computed } from "vue";
import useFormats from "@/components/composables/use-formats";
import { map } from "@/utils";

export default {
  name: "TokenPrice",
  props: {
    data: {
      type: Array,
      required: true,
    },
    current: {
      type: String,
      default: "0.0",
    },
  },
  setup(props) {
    const store = useStore();
    const { currency } = useFormats(store);

    const max = computed(() => {
      const values = [...props.data, { value: parseFloat(props.current) }].map(
        (h) => h.value
      );
      return Math.max(...values);
    });

    const min = computed(() => {
      const values = [...props.data, { value: parseFloat(props.current) }].map(
        (h) => h.value
      );
      return Math.min(...values);
    });

    function height(v) {
      return map(v, min.value / 1.1, max.value * 1.1, 0, 100);
    }

    function blockStyle(block) {
      const h = height(block.value);
      return { height: h + "%" };
    }

    const currentBlockStyle = computed(() => {
      const price = props.current || 0;
      const h = height(price);
      return { height: h + "%" };
    });

    return {
      conversion,
      currency,
      blockStyle,
      currentBlockStyle,
      history,
    };
  },
};
</script>

<style scoped>
.history-block {
  border-right: 1px solid rgb(33, 37, 41);
}
</style>
