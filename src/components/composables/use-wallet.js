import { computed } from "vue";
import web3 from "@/services/common/web3";

export default function useWallet() {
  const address = computed(() => {
    return web3.givenProvider.selectedAddress || '';
  });
  return {
    address,
  };
}
