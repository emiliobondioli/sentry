import FarmService from "./common/farm-service";
import { BatchRequest, setPoolStats } from "./common/farm-service";
import web3 from "./common/web3";
import { parseAddress, convertValue } from "@/utils";

const config = {
  name: "Autofarm",
  url: "https://api.autofarm.network/bsc/get_farms_data",
  address: "0x0895196562c7868c5be92459fae7f877ed450452",
  value: (r) =>
    Object.keys(r.data.pools).map((k) => {
      const pool = r.data.pools[k];
      const data = r.data.table_data.find((d) => d[2] === pool.wantName);
      if (data) pool.farmPid = data[0];
      return pool;
    }),
  keys: {
    name: "wantName",
    contractAddress: (f) => parseAddress(f.farmContractAddress),
    stratAddress: (f) => f.poolInfo.strat,
    farm: "farmName",
    lp: "wantIsLP",
    pid: (f) => parseInt(f.farmPid),
    earnedAddress: (f) => parseAddress(f.earnedAddress),
    wantAddress: (f) => parseAddress(f.wantAddress),
  },
};

export default class AutofarmService extends FarmService {
  constructor() {
    super(config, web3);
  }

  getUserStatsForPool(pool, userAddress) {
    if (!this.contract)
      throw new Error("Farm contract has not been initialized");
    const batch = new BatchRequest();

    /** Current staked tokens for user */
    if (this.contract.methods.stakedWantTokens) {
      batch.add(
        this.contract.methods.stakedWantTokens(pool.pid, userAddress),
        (r) => ({ stakedTokens: convertValue(r) })
      );
    }

    /** Current pending rewards for user */
    if (this.contract.methods.pendingAUTO) {
      batch.add(
        this.contract.methods.pendingAUTO(pool.pid, userAddress),
        (r) => ({ pendingRewards: convertValue(r) })
      );
    }

    batch.modifier = (stats) => setPoolStats(pool, stats);

    return batch;
  }
}

export const service = new AutofarmService(config, web3);
service.init();
