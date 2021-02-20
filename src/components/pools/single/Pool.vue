<template>
  <div class="pool p-4 flex bg-gray bg-opacity-50">
    <div class="pool-info container">
      <PoolHeader :pool="pool" />
      <PoolFields :pool="pool" />
      <div class="flex justify-end">
        <Label
          :text="fiat(totalGain, 3, true)"
          label="Total"
          class="bg-blue-light text-white"
        />
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
      totalGain
    };
  },
};
</script>