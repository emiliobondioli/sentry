import ERC20_ABI from "@/assets/abis/ERC20.json";
import { BatchRequest } from "./utils";
import web3 from "./web3";

export class WalletService {
  /**
   *
   * @param {web3} web3
   */
  constructor(provider) {
    this.web3 = provider;
  }

  /**
   * Gets current stats for contract tokens
   */
  async getTokenBalances(address, tokens) {
    const request = new this.web3.BatchRequest();
    const batch = new BatchRequest();
    tokens.forEach((t) => {
      const contract = new this.web3.eth.Contract(ERC20_ABI, t.address);
      if (contract.methods.balanceOf) {
        batch.add(contract.methods.balanceOf(address), (r) => {
          const b = {};
          b[t.address] = web3.utils.fromWei(r, "gwei");
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

export default new WalletService(web3);
