<template>
  <div
    class="dark-mode-toggle p-2 bg-gray w-8 h-8 flex justify-center items-center rounded-full cursor-pointer dark:bg-green-light dark:text-black"
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
      store.dispatch("preferences", { darkMode: !dark.value });
    }
    return { toggle };
  },
};
</script>

<style></style>
