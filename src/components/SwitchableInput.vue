<template>
  <input
    v-if="editing || !modelValue"
    :value="modelValue"
    @input="update"
    @keydown.enter="editing = false"
    @blur="editing = false"
    @focus="edit"
    :placeholder="placeholder"
    ref="input"
    class="p-1 text-md border bg-gray-light border-gray rounded-sm dark:bg-gray-darkest dark:border-gray-darkest"
    :class="editClass"
  />
  <span v-else @click="edit" class="cursor-pointer">{{ modelValue }}</span>
</template>

<script>
import { ref } from "vue";

export default {
  name: "SwitchableInput",
  props: {
    modelValue: String,
    placeholder: String,
    editClass: String
  },
  setup(props, { emit }) {
    function update(e) {
      emit("update:modelValue", e.target.value);
    }

    const editing = ref(false);
    const input = ref(null);

    function edit() {
      editing.value = true;
      setTimeout(() => {
        input.value.focus();
      }, 100);
    }

    return {
      update,
      editing,
      input,
      edit,
    };
  },
};
</script>