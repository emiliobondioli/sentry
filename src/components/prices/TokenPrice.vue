<template>
  <div class="token-price">
    <div class="flex p-1 mb-2 mt-4">
      <div class="flex-1 text-xl flex items-center">
        <span>{{ token.name }}</span>
        <div
          class="ml-2 w-4 h-4 inline-flex justify-center items-center rounded-full cursor-pointer"
          :class="priceNotifications ? 'text-gray-light' : 'text-gray-dark'"
          @click="toggleNotifications"
        >
          <img src="@/assets/icons/bell.svg" svg-inline class="fill-current" />
        </div>
      </div>
      <div class="text-right">{{ currency(conversion.price, 14) }}BNB</div>
    </div>
    <div class="p-1">
      <div class="flex p-1 mb-2">
        <div class="flex-1">
          <div class="flex justify-between">
            <span>Amount</span
            ><span
              >Balance: {{ currency(balance, 2) }}
              <span class="text-gray">{{ token.symbol }}</span></span
            >
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
        <div class="w-32 text-lg p-1 text-right flex flex-col justify-end">
          <div>
            <span>{{ conversion.bnb }}</span>
            <img
              src="@/assets/tokens/bnb-logo.png"
              class="w-4 h-4 inline ml-0.5 align-baseline"
            />
          </div>
          <p class="text-sm">{{ currency(conversion.eur, 2) }}€</p>
        </div>
      </div>
      <PriceChart :data="history" v-if="history.length > 2" />
    </div>
  </div>
</template>

<script>
import { useStore } from "vuex";
import { computed, ref, watch } from "vue";
import useFormats from "@/components/composables/use-formats";
import usePriceNotifications from "@/components/composables/use-price-notifications";
import PriceChart from "./PriceChart.vue";
import { DateTime } from "luxon"; 

export default {
  components: { PriceChart },
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

    const candle = ref(null);
    const history = ref([]);
    const sample = ref(128);
    const range = computed(() => history.value.slice(-sample.value));
    const dirty = ref(false);

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
      if (!amount.value) return 0;
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
      checkNotify(parseFloat(conversion.value.eur));
      store.commit("prices/history", { address: props.token.address, history });
      console.log(history.value)
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

    setInterval(updateCandle, 1000);
    setInterval(addHistoryBlock, 3000);

    watch(balance, () => {
      if (!dirty.value || amount.value === 0) amount.value = balance.value;
    });

    return {
      conversion,
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
    };
  },
};
</script>

<style scoped>
.history-block {
  border-right: 1px solid rgb(33, 37, 41);
}
</style>
