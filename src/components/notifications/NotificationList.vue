<template>
  <div class="token-notifications relative">
    <img
      src="@/assets/icons/bell.svg"
      class="fill-current w-5 h-5 mx-2 cursor-pointer"
      :class="!notifications.length ? 'text-gray-darkest' : 'text-white'"
      @click.stop="open"
      svg-inline
    />
    <div
      class="absolute top-2 right-2 w-80 bg-black-dark rounded-sm p-1 pt-3 shadow-md z-20"
      v-if="show"
      @click.stop
    >
      <img
        src="@/assets/icons/remove.svg"
        svg-inline
        @click.stop="close"
        class="fill-current absolute w-4 top-0.5 right-0.5 cursor-pointer z-10"
      />
      <div class="text-sm flex mb-1">
        <span class="mr-2"
          ><input type="checkbox" v-model="browserNotifications" />
          Browser</span
        >
        <span
          ><input type="checkbox" v-model="soundNotifications" /> Sound</span
        >
      </div>
      <div class="w-full max-h-64 overflow-auto">
        <template v-if="notifications.length">
          <notification-item
            v-for="notification in notifications"
            :notification="notification"
            :key="notification.date"
          />
        </template>
        <span v-else class="text-sm">No notifications.</span>
      </div>
    </div>
  </div>
</template>

<script>
import { useStore } from "vuex";
import { computed } from "vue";
import NotificationItem from "@/components/notifications/NotificationItem.vue";
import useTooltip from "@/components/composables/use-tooltip";
import useTokenNotifications from "@/components/composables/use-token-notifications";

export default {
  components: { NotificationItem },
  name: "NotificationList",
  setup() {
    const store = useStore();
    const { show, open, close } = useTooltip();
    const { notify } = useTokenNotifications({ store });
    function test() {
      notify({
        text: "test",
        type: "up",
      });
    }

    const browserNotifications = computed({
      get() {
        return store.state.preferences.browserNotifications;
      },
      set(value) {
        store.dispatch("preferences/set", { browserNotifications: value });
      },
    });

    const soundNotifications = computed({
      get() {
        return store.state.preferences.soundNotifications;
      },
      set(value) {
        store.dispatch("preferences/set", { soundNotifications: value });
      },
    });

    const notifications = computed(() =>
      store.state.notifications.list.slice().sort((a, b) => b.date - a.date)
    );

    return {
      browserNotifications,
      soundNotifications,
      notifications,
      show,
      open,
      close,
      test,
    };
  },
};
</script>
