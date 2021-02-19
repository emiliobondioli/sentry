<template>
  <div
    class="pool-label border-b border-gray-darkest pb-1 bg-green-light rounded-md px-2 py-1 ext-xl text-gray flex"
  >
    <span class="mr-0.5">{{ text }}</span>
    <label class="font-bold ml-0.5">{{ label }}</label>
  </div>
</template>

<script>
export default {
  name: "PoolLabel",
  props: {
    label: {
      type: String,
      required: true,
    },
    text: {
      type: String,
      default: null,
    },
  },
};
</script>
