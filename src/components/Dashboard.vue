<template>
  <div class="dashboard">
    <Farm v-for="(farm, index) in farms" :key="index" :farm="farm" />
  </div>
</template>

<script>
import Farm from "./platforms/Farm.vue";
import { useStore } from "vuex";
import { computed } from "vue";

export default {
  name: "Dashboard",
  components: {
    Farm,
  },
  setup() {
    const store = useStore();
    const farms = computed(() => store.state.farms);
    return { farms };
  },
};
</script>
