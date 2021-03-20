<template>
  <div class="token-price w-full bg-black-dark rounded-sm p-1 mb-2">
    <div class="flex p-1">
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
            <img
              src="@/assets/icons/delete.svg"
              svg-inline
              class="fill-current"
            />
          </IconToggle>
          <img
            src="@/assets/icons/copy.svg"
            svg-inline
            @click="copyTokenAddress"
            class="fill-current inline w-4 cursor-pointer ml-2 align-text-top opacity-0 group-hover:opacity-100"
          />
        </div>
        <IconToggle
          class="align-middle w-5"
          :active="priceNotifications"
          @click="toggleNotifications"
        >
          <img src="@/assets/icons/bell.svg" svg-inline class="fill-current" />
        </IconToggle>
      </div>
    </div>
    <div class="flex p-1 justify-between">
      <div>
        <a :href="bscScanLink" target="_blank" class="mr-2 h-4">
          <img
            src="@/assets/icons/external.svg"
            svg-inline
            class="fill-current inline w-4 cursor-pointer align-text-top"
          />
        </a>
        <a :href="unidexLink" target="_blank" class="h-4">
          <img
            src="@/assets/icons/candles.svg"
            svg-inline
            class="fill-current inline w-4 cursor-pointer align-text-top"
          />
        </a>
      </div>
      <div>
        <div class="text-right">
          {{ currency(conversion.price, 14) }}
          <img
            src="@/assets/tokens/bnb-logo.png"
            class="w-4 h-4 inline ml-0.5 align-baseline"
          />
        </div>
      </div>
    </div>
    <div class="p-1">
      <div class="flex mb-2">
        <div class="flex-1">
          <div class="flex flex-col-reverse md:flex-row md:justify-between">
            <span>Amount</span>
            <p>
              Balance: <span>{{ currency(balance, 2) }}&nbsp;</span>
              <span class="text-gray hidden md:inline">{{ token.symbol }}</span>
            </p>
          </div>
          <div class="relative">
            <input
              class="p-2 text-lg border w-full bg-gray-light border-gray rounded-sm dark:bg-gray-darkest dark:border-gray-darkest"
              type="number"
              v-model="amount"
              @input="dirty = true"
            />
            <button
              v-if="amount !== balance"
              @click="setMaxBalance"
              class="text-sm disabled:opacity-50 disabled:cursor-auto bg-gray-light rounded-md p-1 mr-2 ext-xl text-black font-bold absolute right-0 top-2"
            >
              MAX
            </button>
          </div>
        </div>
        <div class="w-32 text-lg text-right flex flex-col justify-end">
          <div>
            <span>{{ conversion.bnb }}</span>
            <img
              src="@/assets/tokens/bnb-logo.png"
              class="w-4 h-4 inline ml-1 align-baseline"
            />
          </div>
          <p class="text-sm">{{ currency(conversion.eur, 2) }}€</p>
        </div>
      </div>
      <div class="bg-black" v-if="false">
        <IconToggle
          class="ml-2 w-6 h-6"
          @click="graphType = 'blocks'"
          :active="graphType === 'blocks'"
        >
          <img
            src="@/assets/icons/blocks.svg"
            svg-inline
            class="fill-current"
          />
        </IconToggle>
        <IconToggle
          class="ml-2 w-6 h-6"
          @click="graphType = 'candlesticks'"
          :active="graphType === 'candlesticks'"
        >
          <img
            src="@/assets/icons/candles.svg"
            svg-inline
            class="fill-current"
          />
        </IconToggle>
      </div>
      <CandlesticksChart
        :data="graphData"
        v-if="history.length > 2 && graphType === 'candlesticks'"
      />
      <BlockChart :data="graphData" v-else-if="graphType === 'blocks'" />
    </div>
  </div>
</template>

<script>
import { useStore } from "vuex";
import { computed, ref, watch } from "vue";
import useFormats from "@/components/composables/use-formats";
import usePriceNotifications from "@/components/composables/use-price-notifications";
import CandlesticksChart from "./CandlesticksChart.vue";
import BlockChart from "./BlockChart.vue";
import IconToggle from "@/components/IconToggle.vue";
import SwitchableInput from "@/components/SwitchableInput.vue";
import { DateTime } from "luxon";
import { copyToClipboard } from "@/utils";

export default {
  components: { CandlesticksChart, BlockChart, IconToggle, SwitchableInput },
  name: "TokenPrice",
  props: {
    token: {
      type: Object,
      required: true,
    },
  },
  setup(props) {
    const store = useStore();
    const { currency } = useFormats(store);
    let init = false;

    const edit = ref({ ...props.token });

    const sample = ref(120);
    const candle = ref(null);
    const graphType = ref("blocks");
    const history = ref([]);
    const range = computed(() => history.value.slice(-sample.value));
    const graphData = computed(() => {
      if (!candle.value) return [];
      return [...range.value, candle.value];
    });

    const bscScanLink = computed(
      () => `https://bscscan.com/token/${props.token.address}`
    );
    const unidexLink = computed(
      () => `https://unidexbeta.app/bscCharting?token=${props.token.address}`
    );
    const dirty = ref(false);

    function copyTokenAddress() {
      copyToClipboard(props.token.address);
    }

    const balance = computed(() => {
      const price = store.getters["balances/address"](props.token.address);
      return parseFloat(price) || 0;
    });

    const price = computed(() => {
      const symbol = store.getters["prices/address"](props.token.address);
      return symbol ? symbol.price : 0;
    });

    const amount = ref(balance.value);
    const conversion = computed(() => {
      return store.getters["prices/convert"](amount.value, props.token.address);
    });

    const {
      checkNotify,
      priceNotifications,
      toggleNotifications,
    } = usePriceNotifications({
      props,
      store,
      conversion,
    });

    function setMaxBalance() {
      dirty.value = false;
      amount.value = balance.value;
    }

    function addHistoryBlock() {
      updateCandle();
      history.value.push({
        ...candle.value,
      });
      checkNotify(parseFloat(conversion.value.price));
      store.commit("prices/history", { address: props.token.address, history });
    }

    function updateCandle() {
      if (!init) candle.value = initCandle();
      const v = conversion.value.price;
      if (v > candle.value.high) candle.value.high = v;
      if (v < candle.value.low) candle.value.low = v;
      candle.value.close = v;
    }

    function initCandle() {
      const v = conversion.value.eur;
      init = true;
      return {
        t: DateTime.now().valueOf(),
        o: v,
        h: v,
        l: v,
        c: v,
      };
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

    setInterval(updateCandle, 1000);
    setInterval(addHistoryBlock, 3000);

    watch(balance, () => {
      if (!dirty.value || amount.value === 0) amount.value = balance.value;
    });

    return {
      conversion,
      edit,
      update,
      remove,
      currency,
      price,
      history,
      dirty,
      setMaxBalance,
      balance,
      amount,
      range,
      priceNotifications,
      toggleNotifications,
      graphType,
      graphData,
      bscScanLink,
      unidexLink,
      copyTokenAddress,
    };
  },
};
</script>

<style>
.token-symbol {
  margin-right: 0.5rem;
}
</style>
