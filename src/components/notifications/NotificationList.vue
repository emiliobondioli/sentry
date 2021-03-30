<template>
  <div class="token-notifications relative">
    <img
      src="@/assets/icons/bell.svg"
      class="fill-current w-5 h-5 mx-2 cursor-pointer"
      :class="!notifications.length ? 'text-gray-darkest' : 'text-white'"
      @click="open = true"
      svg-inline
    />
    <div
      class="absolute top-2 right-2 w-80 bg-black-dark rounded-sm p-1 pt-3 shadow"
      v-if="open"
    >
      <div>
        <input type="checkbox" v-model="browserNotifications" /> Browser
        <input type="checkbox" v-model="soundNotifications" /> Sound
      </div>
      <img
        src="@/assets/icons/remove.svg"
        svg-inline
        @click="open = false"
        class="fill-current absolute w-4 top-0.5 right-0.5 cursor-pointer z-10"
      />
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
import { computed, ref } from "vue";
import NotificationItem from "@/components/notifications/NotificationItem.vue";

export default {
  components: { NotificationItem },
  name: "NotificationList",
  setup() {
    const store = useStore();
    const open = ref(false);

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
      open,
    };
  },
};
</script>
