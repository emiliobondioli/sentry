<template>
  <div
    class="pool-field border-b border-gray dark:border-gray-lightest border-opacity-10 dark:border-opacity-10 pb-1 mb-1 flex w-full justify-between"
  >
    <div>
      <label class="font-bold">{{ label }} </label>
      <p class="text-gray text-xs" v-if="info !== undefined">
        <template v-if="!loading">
          {{ info }}
        </template>
        <SmallLoader v-else class="w-4 h-4"/>
      </p>
    </div>
    <div class="text-right">
      {{ format(value) }}
      <span class="text-black dark:text-gray">{{ currency }}</span>
      <span class="text-xs text-black-light" v-if="conversion"
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