<template>
  <div class="flex-1 flex items-center group justify-between">
    <div>
      <SwitchableInput
        v-model="edit.symbol"
        @update:modelValue="update"
        placeholder="Symbol"
        class="token-symbol font-bold text-lg text-gray-dark"
        editClass="w-20"
      />
      <SwitchableInput
        v-model="edit.name"
        @update:modelValue="update"
        class="text-lg"
        placeholder="Token name"
      />
      <IconToggle
        class="ml-2 w-4 h-4 opacity-0 group-hover:opacity-100"
        @click="remove"
      >
        <img src="@/assets/icons/delete.svg" svg-inline class="fill-current" />
      </IconToggle>
      <img
        src="@/assets/icons/copy.svg"
        svg-inline
        @click="copyTokenAddress"
        class="fill-current inline w-4 cursor-pointer ml-2 align-text-top opacity-0 group-hover:opacity-100"
      />
    </div>
    <div class="flex">
      <img
        v-if="error"
        src="@/assets/icons/warning.svg"
        svg-inline
        class="w-5 fill-current mr-1"
        title="Error getting token info - too early?"
        alt="Error getting token info"
      />
      <TokenNotifications :token="token" />
    </div>
  </div>
</template>

<script>
import { useStore } from "vuex";
import { ref, computed } from "vue";
import TokenNotifications from "@/components/prices/TokenNotifications.vue";
import IconToggle from "@/components/IconToggle.vue";
import SwitchableInput from "@/components/SwitchableInput.vue";
import { copyToClipboard } from "@/utils";

export default {
  components: { SwitchableInput, TokenNotifications, IconToggle },
  name: "TokenPrice",
  props: {
    token: {
      type: Object,
      required: true,
    },
  },
  setup(props) {
    const store = useStore();

    const edit = ref({ ...props.token });
    const error = computed(() =>
      store.getters["prices/error"](props.token.address)
    );

    function copyTokenAddress() {
      copyToClipboard(props.token.address);
    }

    let debounceUpdate = null;
    function update() {
      if (debounceUpdate) clearTimeout(debounceUpdate);
      debounceUpdate = setTimeout(() => {
        store.dispatch("prices/update", edit.value);
      }, 200);
    }

    function remove() {
      store.dispatch("prices/remove", props.token);
    }

    return {
      edit,
      update,
      remove,
      copyTokenAddress,
      error,
    };
  },
};
</script>