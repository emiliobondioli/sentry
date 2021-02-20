import { autofarm } from "@/config/platforms";
import web3 from "./common/web3";
import { FarmService } from "./common/farm-service";
import { BatchRequest } from "./common/utils";
import { parseAddress, convertValue } from "@/utils";

export default class AutofarmService extends FarmService {
  parsePools(r, farm) {
    return Object.keys(r.data.pools)
      .map((k) => {
        const pool = r.data.pools[k];
        const data = r.data.table_data.find((d) => d[2] === pool.wantName);
        return {
          name: pool.wantName,
          address: farm.address,
          pid: data ? parseInt(data[0]) : null,
          lp: pool.wantIsLP,
          farm: pool.farmName,
          stratAddress: parseAddress(pool.poolInfo.strat),
          contractAddress: parseAddress(pool.farmContractAddress),
          earnedAddress: parseAddress(pool.earnedAddress),
          wantAddress: parseAddress(pool.wantAddress),
          info: {
            ...pool,
            rewardPrice: pool.poolAUTOPerBlock
              ? pool.poolUSDPerBlock / pool.poolAUTOPerBlock
              : null,
          },
        };
      })
      .filter((p) => p.pid !== null);
  }

  getUserStatsForPool(pool, userAddress) {
    if (!this.contract)
      throw new Error("Farm contract has not been initialized");
    const batch = new BatchRequest();

    /** Current staked tokens for user */
    if (this.contract.methods.stakedWantTokens) {
      batch.add(
        this.contract.methods.stakedWantTokens(pool.pid, userAddress),
        (r) => ({ currentTokens: convertValue(r) })
      );
    }

    /** Current pending rewards for user */
    if (this.contract.methods.pendingAUTO) {
      batch.add(
        this.contract.methods.pendingAUTO(pool.pid, userAddress),
        (r) => ({ pendingRewards: convertValue(r) })
      );
    }

    /** User info */
    if (this.contract.methods.userInfo) {
      batch.add(this.contract.methods.userInfo(pool.pid, userAddress), (r) => ({
        userInfo: r,
      }));
    }

    /** User info */
    if (this.contract.methods.AUTOv2) {
      batch.add(this.contract.methods.AUTOv2(), (r) => ({
        rewardSymbol: "AUTO",
        rewardAddress: r,
      }));
    }

    batch.modifier = (stats) => this.setPoolStats(pool, stats);

    return batch;
  }
}

export const service = new AutofarmService(autofarm, web3);
