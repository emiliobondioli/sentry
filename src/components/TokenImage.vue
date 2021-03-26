<template>
  <img
    v-if="!missing"
    :src="src"
    @error="replaceMissingImage"
    @load="show = true"
    class="rounded-full w-8 h-8"
    :class="show ? '' : 'opacity-0'"
  />
  <img v-else src="@/assets/tokens/missing.svg" class="rounded-full w-8 h-8" />
</template>

<script>
import { ref, computed } from "vue";
import { parseAddress } from "@/utils";
const IMG_BASE = "https://exchange.pancakeswap.finance/images/coins/";
const IMG_BACKUP =
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
    const backup = ref(false);
    const show = ref(false);
    function replaceMissingImage() {
      show.value = false
      if (!backup.value) backup.value = true;
      else missing.value = true;
    }
    const src = computed(() => {
      const address = parseAddress(props.token.address || props.token.id);
      if (!backup.value) return IMG_BASE + address + ".png";
      else return IMG_BACKUP + address + "/logo.png";
    });
    return {
      missing,
      src,
      replaceMissingImage,
      show
    };
  },
};
</script>

<style>
</style>