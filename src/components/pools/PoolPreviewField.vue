<template>
  <div
    class="pool-field border-b border-gray-darkest pb-1 mb-1 flex w-full justify-between"
  >
    <div class="text-left">
      {{ format(value) }}
      <span class="text-green">{{ currency }}</span>
      <span class="text-xs text-gray-light" v-if="conversion"
        >≈{{ conversion(value) }}</span
      >
      <p class="text-green text-xs" v-if="info">
        {{ info }}
      </p>
    </div>
    <div class="text-right">
      <template v-if="change>0">+</template>{{ format(change) }}
      <span class="text-green">{{ currency }}</span>
      <span class="text-xs text-gray-light" v-if="conversion"
        >≈{{ conversion(change) }}</span
      >
    </div>
  </div>
</template>

<script>
import { props } from "@/components/composables/use-pool-field";

export default {
  name: "VaultFieldLite",
  props: {
    ...props,
    change: {
      type: Number,
      default: 0
    }
  },
};
</script>