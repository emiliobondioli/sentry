<template>
  <div class="block-chart flex items-end justify-end overflow-x-auto flex-nowrap" >
    <div
      v-for="block in data"
      :key="block.time"
      class="history-block bg-gray w-1.5"
      :style="blockStyle(block)"
    ></div>
    <div
      class="history-block bg-gray-light w-1.5"
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
  },
  setup(props) {
    const store = useStore();
    const { currency } = useFormats(store);

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

    return {
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
