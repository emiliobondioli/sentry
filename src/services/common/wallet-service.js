import ERC20_ABI from "@/assets/abis/ERC20.json";
import { isSameAddress } from "@/utils";
import { BSCService } from "./bsc-service";
import { BatchRequest } from "./utils";
import web3 from "./web3";

export class WalletService extends BSCService {
  constructor(config) {
    super(config);
    this.tokens = [];
  }

  /**
   * Gets current stats for contract tokens
   */
  async getTokenBalances(address, tokens) {
    await web3.init();
    const request = new web3.provider.BatchRequest();
    const batch = new BatchRequest();
    tokens.forEach((t) => {
      const contract = new web3.provider.eth.Contract(ERC20_ABI, t.address);
      this.tokens.push({ address: t.address, contract });
      if (contract.methods.balanceOf) {
        batch.add(contract.methods.balanceOf(address), (r) => {
          const b = {};
          b[t.address] = r / Math.pow(10, t.token.decimals);
          return b;
        });
      }
    });

    batch.addToRequest(request);

    request.execute();
    return batch.all().then((r) => {
      const balances = r.reduce((acc, curr) => {
        acc = { ...acc, ...curr };
        return acc;
      }, {});
      return balances;
    });
  }

  async getContractEvents({ contract, options }) {
    return contract.getPastEvents("allEvents", options).then((r) => {
      // console.log(r)
    });
  }

  async getUserTransactions(address, tokens) {
    return this.getTransactions(address).then((r) => {
      const transactions = tokens.map((token) => {
        const tokenTx = r.filter((t) =>
          isSameAddress(t.contractAddress, token.address)
        );
/*         if (tokenTx.length) {
          const tc = this.tokens.find((c) =>
            isSameAddress(c.address, token.address)
          );
          if (tc) {
            tokenTx.forEach(tx => {
              this.getContractEvents({
                contract: tc.contract,
                options: { fromBlock: tx.blockNumber, toBlock: tx.blockNumber },
              });
            })
          }
        } */
        return {
          address: token.address,
          transactions: tokenTx,
        };
      });
      return transactions;
    });
  }
}

export default new WalletService();
