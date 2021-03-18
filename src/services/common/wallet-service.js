import ERC20_ABI from "@/assets/abis/ERC20.json";
import { BatchRequest } from "./utils";
import web3 from "./web3";

export class WalletService {
  /**
   * Gets current stats for contract tokens
   */
  async getTokenBalances(address, tokens) {
    await web3.init()
    const request = new web3.provider.BatchRequest();
    const batch = new BatchRequest();
    tokens.forEach((t) => {
      const contract = new web3.provider.eth.Contract(ERC20_ABI, t.address);
      if (contract.methods.balanceOf) {
        batch.add(contract.methods.balanceOf(address), (r) => {
          const b = {};
          b[t.address] = web3.provider.utils.fromWei(r, "gwei");
          return b;
        });
      }
    });

    batch.addToRequest(request);

    request.execute();
    return batch.all().then((r) => {
      const balances = r.reduce((acc, curr) => {
        acc = { ...acc, ...curr };
        return acc
      }, {});
      return balances;
    });
  }
}

export default new WalletService();
