<template>
  <div
    class="dark-mode-toggle p-2  w-8 h-8 flex justify-center items-center rounded-full cursor-pointer bg-gray-dark text-gray-light dark:bg-gray-light dark:text-black"
    @click="toggle"
  >
    <img src="@/assets/icons/moon.svg" class="fill-current" svg-inline />
  </div>
</template>

<script>
import { useStore } from "vuex";
import { computed } from "vue";

export default {
  name: "DarkModeSwitch",
  setup() {
    const store = useStore();
    const dark = computed(() => store.state.preferences.darkMode);
    function toggle() {
      store.dispatch("preferences/set", { darkMode: !dark.value });
    }
    return { toggle };
  },
};
</script>

<style></style>
