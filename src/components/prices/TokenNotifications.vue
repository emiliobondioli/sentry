<template>
  <div class="flex relative">
    <img
      @click.stop="open"
      src="@/assets/icons/settings.svg"
      svg-inline
      class="fill-current align-middle w-5 cursor-pointer"
    />
    <div
      class="notification-options absolute top-0 right-0 w-32 h-24 bg-gray-darkest rounded-sm p-1 shadow z-20"
      v-if="show"
    >
      <img
        src="@/assets/icons/remove.svg"
        svg-inline
        @click.stop="close"
        class="fill-current absolute w-4 top-0.5 right-0.5 cursor-pointer"
      />
      <div class="text-sm ml-2">
        <IconToggle
          class="align-middle w-5 mr-1"
          :active="enableNotifications"
          @click.stop="toggleNotifications"
        >
          <img
            src="@/assets/icons/bell.svg"
            svg-inline
            class="fill-current align-middle"
          />
        </IconToggle>
        <span :class="enableNotifications ? 'text-white' : 'text-gray'"
          >Enable</span
        >
        <div
          class="mt-2"
          :class="
            range.up.enable && enableNotifications ? 'text-white' : 'text-gray'
          "
        >
          <img
            src="@/assets/icons/arrow-up.svg"
            svg-inline
            class="inline w-4 cursor-pointer fill-current"
            @click.stop="toggleRange('up')"
          />
          <input
            type="number"
            v-model="range.up.value"
            class="rounded-sm w-6 p-0.5 bg-gray-dark text-center"
            @input="update"
          />
          %
        </div>
        <div
          :class="
            range.down.enable && enableNotifications
              ? 'text-white'
              : 'text-gray'
          "
        >
          <img
            src="@/assets/icons/arrow-down.svg"
            svg-inline
            class="inline w-4 cursor-pointer fill-current"
            @click="toggleRange('down')"
          />
          <input
            type="number"
            v-model="range.down.value"
            class="rounded-sm w-6 p-0.5 bg-gray-dark text-center"
            @input="update"
          />
          %
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { useStore } from "vuex";
import { computed, ref } from "vue";
import useTokenNotifications from "@/components/composables/use-token-notifications";
import IconToggle from "@/components/IconToggle.vue";
import useTooltip from "@/components/composables/use-tooltip";

export default {
  components: { IconToggle },
  name: "TokenNotifications",
  props: {
    token: {
      type: Object,
      required: true,
    },
  },
  setup(props) {
    const store = useStore();
    const { show, open, close } = useTooltip();

    const {
      tokenNotifications,
      toggleNotifications,
      notificationsRange,
      updateNotificationsRange,
    } = useTokenNotifications({
      props,
      store,
    });
    const enableNotifications = computed(() =>
      tokenNotifications.value ? tokenNotifications.value.enable : false
    );
    const range = ref(notificationsRange.value);

    function toggleRange(r) {
      range.value[r].enable = !range.value[r].enable;
      update();
    }

    function update() {
      updateNotificationsRange(range.value);
    }

    return {
      range,
      update,
      tokenNotifications,
      toggleNotifications,
      enableNotifications,
      toggleRange,
      show,
      open,
      close,
    };
  },
};
</script>

<style>
.token-symbol {
  margin-right: 0.5rem;
}
</style>
