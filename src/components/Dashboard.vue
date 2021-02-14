<template>
  <div class="dashboard w-4/5">
    <AutoFarm :data="platforms.autofarm" v-if="platforms.autofarm" />
  </div>
</template>

<script>
import AutoFarm from "./platforms/AutoFarm.vue";
import { computed } from "vue";

export default {
  name: "Dashboard",
  components: {
    AutoFarm,
  },
  props: {
    data: {
      type: Object,
      required: true,
    },
  },
  setup(props) {
    const platforms = computed(() => {
      const platforms = {};
      for (const platform in props.data) {
        platforms[platform.split('Data').join('').toLocaleLowerCase()] = props.data[platform];
      }
      return platforms;
    });
    return { platforms };
  },
};
</script>

<style scoped>
h3 {
  margin: 40px 0 0;
}
ul {
  list-style-type: none;
  padding: 0;
}
li {
  display: inline-block;
  margin: 0 10px;
}
a {
  color: #42b983;
}
</style>
