<template>
  <div class="token-notification flex p-1 justify-between">
    <img
      v-if="notification.type === 'up'"
      src="@/assets/icons/arrow-up.svg"
      class="fill-current w-4 mr-2"
      svg-inline
    />
    <img
      v-else
      src="@/assets/icons/arrow-down.svg"
      class="fill-current w-4 mr-2"
      svg-inline
    />
    <span class="text-sm flex-1">{{ notification.text }}</span>
    <span class="text-xs">{{ date }}</span>
  </div>
</template>

<script>
import { computed } from "vue";
import moment from "moment";

export default {
  name: "NotificationItem",
  props: {
    notification: {
      type: Object,
      required: true,
    },
  },
  setup(props) {
    const date = computed(() => moment(props.notification.date).fromNow());
    return {
      date,
    };
  },
};
</script>
