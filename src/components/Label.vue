<template>
  <div
    class="pool-label border-b border-gray-darkest pb-1 bg-green-light rounded-md px-2 py-1 ext-xl text-gray flex"
    :class="{ 'flex-row-reverse': reverse }"
  >
    <span :class="reverse ? 'ml-0.5' : 'mr-0.5'">{{
      text
    }}</span>
    <label class="font-bold" :class="reverse ? 'mr-0.5' : 'ml-0.5'">{{
      label
    }}</label>
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
  },
};
</script>
