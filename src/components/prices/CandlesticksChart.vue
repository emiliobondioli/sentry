
<template>
  <div class="token-price-chart">
    <canvas class="w-full h-32" ref="graph"></canvas>
  </div>
</template>

<script>
import { useStore } from "vuex";
import { computed, ref, watch, onMounted } from "vue";
import useFormats from "@/components/composables/use-formats";
import { Chart } from "chart.js";
import "@/vendor/chartjs-chart-financial/index";

export default {
  name: "TokenPrice",
  props: {
    data: {
      type: Array,
      required: true,
    },
  },
  setup(props) {
    const graph = ref(null);
    let ctx, chart;

    function create() {
      ctx = graph.value.getContext("2d");
      chart = new Chart(ctx, {
        type: "candlestick",
        data: {
          datasets: [
            {
              label: "BAU",
              data: props.data,
            },
          ],
        },
      });
      // console.log(chart);
      chart.update();
    }

    watch(props.data, () => {
      chart.update();
    });

    onMounted(() => {
      create();
    });

    return {
      graph,
    };
  },
};
</script>

<style scoped>
.history-block {
  border-right: 1px solid rgb(33, 37, 41);
}
</style>
