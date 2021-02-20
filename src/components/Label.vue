<template>
  <div
    class="label pb-1 rounded-md px-2 py-1 ext-xl text-black flex"
    :class="[reverse ? 'flex-row-reverse' : 'flex-row', background]"
  >
    <span class="font-bold" :class="reverse ? 'ml-0.5' : 'mr-0.5'">{{
      text
    }}</span>
    <label :class="reverse ? 'mr-0.5' : 'ml-0.5'">{{ label }}</label>
  </div>
</template>

<script>
export default {
  name: "Label",
  props: {
    label: {
      type: String,
      required: true,
    },
    text: {
      type: String,
      default: null,
    },
    reverse: {
      type: Boolean,
      default: false,
    },
    background: {
      type: String,
      default: "bg-gray-light dark:bg-gray-light",
    },
  },
};
</script>
