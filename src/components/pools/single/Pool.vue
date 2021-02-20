<template>
  <div class="pool p-4 flex bg-gray-lightest dark:bg-gray-darkest">
    <div class="pool-info container">
      <PoolHeader :pool="pool" />
      <PoolFields :pool="pool" />
      <div class="flex justify-end mt-2">
        <Label :text="fiat(totalGain, 2, true)" label="Total" />
      </div>
    </div>
  </div>
</template>

<script>
import { useStore } from "vuex";
import useFormats from "@/components/composables/use-formats.js";
import usePool from "@/components/composables/use-pool.js";
import PoolFields from "@/components/pools/single/PoolFields";
import Label from "@/components/Label";
import PoolHeader from "@/components/pools/PoolHeader";

export default {
  name: "Pool",
  components: {
    PoolFields,
    Label,
    PoolHeader,
  },
  props: {
    pool: {
      type: Object,
      required: true,
    },
  },
  setup(props) {
    const store = useStore();
    const { fiat } = useFormats(store);
    const { totalGain } = usePool(props.pool);

    return {
      fiat,
      totalGain,
    };
  },
};
</script>