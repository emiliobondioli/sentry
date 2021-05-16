<template>
  <div
    class="relative flex-1 flex flex-col md:flex-row items-start md:items-center group justify-between cursor-pointer"
  >
    <div class="w-48 relative">
      <token-image :token="token" class="inline mr-2 w-6 h-6" />
      <SwitchableInput
        v-model="edit.symbol"
        @update:modelValue="update"
        placeholder="Symbol"
        class="token-symbol text-md"
        editClass="w-24"
        @click.stop
        @drag.stop
      />
      <IconToggle
        class="w-4 h-4 opacity-0 group-hover:opacity-100"
        @click.stop="remove"
      >
        <img src="@/assets/icons/delete.svg" svg-inline class="fill-current" />
      </IconToggle>
      <img
        src="@/assets/icons/copy.svg"
        svg-inline
        @click.stop="copyTokenAddress"
        class="fill-current inline w-4 cursor-pointer ml-2 align-text-top opacity-0 group-hover:opacity-100"
      />
    </div>
    <TokenPricePreview v-if="preview" :data="data" :token="token" />
    <div class="flex absolute right-0.5 top-0.5 md:static">
      <TokenNotifications :token="token" />
      <img
        src="@/assets/icons/warning.svg"
        v-if="error"
        svg-inline
        class="w-5 color-dark fill-current absolute -top-4 -right-4 animate-pulse	"
        title="Error getting token info - too early?"
        alt="Error getting token info"
      />
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
import TokenImage from "@/components/TokenImage.vue";
import TokenPricePreview from "@/components/prices/TokenPricePreview.vue";

export default {
  components: {
    SwitchableInput,
    TokenNotifications,
    IconToggle,
    TokenImage,
    TokenPricePreview,
  },
  name: "TokenPriceHeader",
  props: {
    token: {
      type: Object,
      required: true,
    },
    preview: {
      type: Boolean,
      default: false,
    },
    data: {
      type: Object,
      required: true,
    },
  },
  setup(props) {
    const store = useStore();

    const edit = ref({ ...props.token });
    const error = computed(
      () => store.getters["prices/error"](props.token.address)
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