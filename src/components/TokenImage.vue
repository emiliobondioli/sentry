<template>
  <img
    v-if="!missing"
    :src="src"
    @error="missing = true"
    class="rounded-full w-8 h-8"
  />
  <img v-else src="@/assets/tokens/missing.svg" class="rounded-full w-8 h-8" />
</template>

<script>
import { ref, computed } from "vue";
import { parseAddress } from "@/utils";
const IMG_BASE =
  "https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/smartchain/assets/";

export default {
  name: "PairImage",
  props: {
    token: {
      type: Object,
      required: true,
    },
  },
  setup(props) {
    const missing = ref(false);
    const src = computed(
      () => IMG_BASE + parseAddress(props.token.address || props.token.id) + "/logo.png"
    );
    return {
      missing,
      src,
    };
  },
};
</script>

<style>
</style>