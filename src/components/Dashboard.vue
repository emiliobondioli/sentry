<template>
  <div class="dashboard">
    <AutoFarm :data="platforms.autofarm" v-if="platforms.autofarm" />
  </div>
</template>

<script>
import AutoFarm from "./platforms/AutoFarm.vue";
import { useStore } from "vuex";
import { computed } from "vue";

export default {
  name: "Dashboard",
  components: {
    AutoFarm,
  },
  setup() {
    const store = useStore();
    const platforms = computed(() => store.state.platforms);
    return { platforms };
  },
};
</script>
