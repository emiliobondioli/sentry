<template>
  <div
    class="inline-flex justify-center items-center rounded-full cursor-pointer"
    :class="active ? 'text-gray-light' : 'text-gray-dark'"
  >
    <slot></slot>
  </div>
</template>

<script>
export default {
  name: "IconToggle",
  props: {
    active: {
      type: Boolean,
      default: true,
    },
  },
};
</script>
