<template>
  <div class="pool-field flex w-full justify-between">
    <div class="text-left">
      {{ format(value) }}
      <span class="text-gray">{{ currency }}</span>
      <span class="text-xs text-black-light" v-if="conversion"
        >≈{{ conversion(value) }}</span
      >
      <p class="text-gray-lightest text-xs" v-if="info !== undefined">
        <template v-if="!loading">
          {{ info }}
        </template>
        <SmallLoader v-else class="w-4 h-4" />
      </p>
    </div>
    <div class="text-right">
      <template v-if="change > 0">+</template>{{ format(change) }}
      <span class="text-gray">{{ currency }}</span>
      <span class="text-xs text-black-light" v-if="conversion"
        >≈{{ conversion(change) }}</span
      >
    </div>
  </div>
</template>

<script>
import { props } from "@/components/composables/use-pool-field";
import SmallLoader from "@/components/SmallLoader.vue";

export default {
  name: "PoolPreviewField",
  components: {
    SmallLoader,
  },
  props: {
    ...props,
    change: {
      type: Number,
      default: 0,
    },
  },
};
</script>