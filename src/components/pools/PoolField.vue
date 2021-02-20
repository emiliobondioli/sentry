<template>
  <div
    class="pool-field border-b border-gray border-opacity-50 pb-1 mb-1 flex w-full justify-between"
  >
    <div>
      <label class="font-bold">{{ label }}: </label>
      <p class="text-green text-xs" v-if="info !== undefined">
        <template v-if="!loading">
          {{ info }}
        </template>
        <SmallLoader v-else class="w-4 h-4"/>
      </p>
    </div>
    <div class="text-right">
      {{ format(value) }}
      <span class="text-green">{{ currency }}</span>
      <span class="text-xs text-gray-light" v-if="conversion"
        >≈{{ conversion(value) }}</span
      >
    </div>
  </div>
</template>

<script>
import SmallLoader from "@/components/SmallLoader.vue";
import { props } from "@/components/composables/use-pool-field";

export default {
  name: "PoolField",
  components: {
    SmallLoader,
  },
  props,
};
</script>