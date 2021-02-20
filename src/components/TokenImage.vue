<template>
  <div class="flex">
    <img :src="tokenImg[0]" class="rounded-full w-8 h-8" />
    <img v-if="tokenImg[1]" :src="tokenImg[1]" class="rounded-full w-8 h-8 transform -translate-x-2" />
  </div>
</template>

<script>
import { computed } from "vue";
export default {
  name: "TokenImage",
  props: {
    token: {
      type: Object,
      required: true,
    },
  },
  setup(props) {
    const tokenImg = computed(() => {
      if (props.token.lp) return [props.token.token0.image, props.token.token1.image];
      return [props.token.image];
    });
    return {
      tokenImg,
    };
  },
};
</script>

<style>
</style>