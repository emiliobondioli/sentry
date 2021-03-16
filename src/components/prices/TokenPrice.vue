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
          <div><span>{{ conversion.bnb }}</span> <img src="@/assets/tokens/bnb-logo.png" class="w-4 h-4 inline ml-0.5 align-baseline" /></div>
          <p class="text-sm">{{ currency(conversion.eur, 2) }}€</p>
        </div>
      </div>
      <div class="flex h-16 py-1 items-end justify-end w-full">
        <div
          v-for="block in range"
          :key="block.time"
          class="history-block bg-gray w-2"
          :style="blockStyle(block)"
        ></div>
        <div
          class="history-block bg-gray-light w-2"
          :style="currentBlockStyle"
        ></div>
      </div>
    </div>
  </div>
</template>

<script>
import { useStore } from "vuex";
import { computed, ref, watch } from "vue";
import useFormats from "@/components/composables/use-formats";
import { map, notify } from "@/utils";

export default {
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
    const price = computed(() => {
      const symbol = store.getters["prices/address"](props.token.address);
      return symbol ? symbol.price : 0;
    });
    const balance = computed(() => {
      const price = store.getters["balances/address"](props.token.address);
      return parseFloat(price) || 0;
    });
    const amount = ref(balance.value);
    const conversion = computed(() => {
      if (!amount.value) return 0;
      return store.getters["prices/convert"](amount.value, props.token.address);
    });
    const history = ref([]);
    const sample = ref(128);
    const priceNotifications = computed(() =>
      store.getters["preferences/priceNotifications"](props.token.address)
    );
    const range = computed(() => history.value.slice(-sample.value));
    const watchRange = [];

    const dirty = ref(false);
    const max = computed(() => {
      const values = [
        ...range.value,
        { value: parseFloat(conversion.value.price) },
      ].map((h) => h.value);
      return Math.max(...values);
    });

    const min = computed(() => {
      const values = [
        ...range.value,
        { value: parseFloat(conversion.value.price) },
      ].map((h) => h.value);
      return Math.min(...values);
    });

    function setMaxBalance() {
      dirty.value = false;
      amount.value = balance.value;
    }

    function height(v) {
      return map(v, min.value / 1.1, max.value * 1.1, 0, 100);
    }

    function blockStyle(block) {
      const h = height(block.value);
      return { height: h + "%" };
    }

    const currentBlockStyle = computed(() => {
      const price = conversion.value ? conversion.value.price : 0;
      const h = height(price);
      return { height: h + "%" };
    });

    function addHistoryBlock() {
      const currentValue = parseFloat(conversion.value.price);
      history.value.push({
        time: new Date(),
        value: currentValue,
      });
      checkNotify(parseFloat(conversion.value.eur));
      store.commit("prices/history", { address: props.token.address, history });
    }

    function checkNotify(value) {
      if (!watchRange.length) return;
      if (value < watchRange[0]) {
        if (priceNotifications.value)
          notify(`${props.token.symbol} DOWN - ${conversion.value.eur}€`);
        setWatchRange(value);
      }
      if (value > watchRange[1]) {
        if (priceNotifications.value)
          notify(`${props.token.symbol} UP - ${conversion.value.eur}€`);
        setWatchRange(value);
      }
    }

    setInterval(addHistoryBlock, 10000);

    function setWatchRange(value) {
      watchRange[0] = value - value * 0.1;
      watchRange[1] = value + value * 0.1;
    }

    function toggleNotifications() {
      store.dispatch("preferences/priceNotifications", {
        address: props.token.address,
        value: !priceNotifications.value,
      });
    }

    watch(conversion, () => {
      if (!watchRange.length) setWatchRange(parseFloat(conversion.value.eur));
    });

    watch(balance, () => {
      if (!dirty.value || amount.value === 0) amount.value = balance.value;
    });

    return {
      conversion,
      currency,
      price,
      blockStyle,
      currentBlockStyle,
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
