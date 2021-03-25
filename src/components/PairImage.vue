<template>
  <div class="flex">
    <TokenImage :token="token.token0" v-if="token" />
    <TokenImage :token="token.token1" v-if="token" class="transform -translate-x-2" />
  </div>
</template>

<script>
import TokenImage from "@/components/TokenImage.vue";

export default {
  name: "PairImage",
  components: { TokenImage },
  props: {
    token: {
      type: Object,
      required: true,
    },
  },
};
</script>

<style>
</style>