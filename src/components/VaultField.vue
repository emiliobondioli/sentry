<template>
  <div
    class="vault-field border-b border-gray border-opacity-50 pb-1 mb-1 flex w-full justify-between"
  >
    <div>
      <label class="font-bold">{{ label }}: </label>
      <p class="text-green text-xs" v-if="info">
        {{ info }}
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
import { props } from "@/components/composables/use-vault-field";

export default {
  name: "VaultField",
  props,
};
</script>