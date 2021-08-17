import PancakePairABI from "@/assets/abis/PancakePair.json";
import ERC20_ABI from "@/assets/abis/ERC20.json";
import { isSameAddress } from "@/utils";
import { BSCService } from "./bsc-service";
import { BatchRequest } from "./utils";
import web3 from "./web3";
import AsyncQueue from "@/utils/async-queue";

export class WalletService extends BSCService {
  constructor(config) {
    super(config);
    this.tokens = [];
  }

  /**
   * Gets current stats for contract tokens
   */
  async getTokenBalances(address, tokens, v2 = false) {
    await web3.init();
    const request = new web3.provider.BatchRequest();
    const batch = new BatchRequest();
    tokens.forEach((t) => {
      const swapContract = new web3.provider.eth.Contract(
        PancakePairABI,
        t[v2 ? "pairv2" : "pair"].liquidityToken.address
      );
      const contract = new web3.provider.eth.Contract(ERC20_ABI, t.address);
      this.tokens.push({ address: t.address, contract, swapContract });
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

  async getContractEvents({ contract, options, type = "allEvents" }) {
    return contract.getPastEvents(type, options);
  }

  async getUserSwaps({ address, tokens, transactions }) {
    this.queue = new AsyncQueue();
    const tokenTxs = await this.getUserTokenTransactions({
      tokens,
      transactions,
    });
    const swaps = tokenTxs.map(async (t) => {
      const swaps = await this.getTokenSwaps(t, address).then((events) => {
        return events.flat();
      });
      return { ...t, swaps };
    });
    await this.queue.process();
    return Promise.all(swaps);
  }

  async getUserTokenTransactions({ tokens, transactions }) {
    const tokenTxs = tokens
      .map((token) => {
        const tokenTx = transactions.filter((t) =>
          isSameAddress(t.contractAddress, token.address)
        );
        return {
          ...token,
          transactions: tokenTx,
        };
      })
      .filter((t) => t.transactions.length);
    return tokenTxs;
  }

  async getTokenSwaps(token, address) {
    const swaps = token.transactions
      .map((t) => {
        const tc = this.tokens.find((c) =>
          isSameAddress(c.address, token.address)
        );
        if (!tc) return null;
        const blockNumber = parseInt(t.blockNumber);
        const item = this.queue.add(this.getContractEvents, {
          type: "Swap",
          contract: tc.swapContract,
          options: {
            fromBlock: blockNumber,
            toBlock: blockNumber,
            filter: { to: address },
          },
        });
        return item;
      })
      .filter((s) => s);
    return Promise.all(swaps);
  }
}

export default new WalletService();
