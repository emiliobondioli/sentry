import axios from "axios";
import { isSameAddress } from "@/utils";

const API_BASE =
  "https://api.bscgraph.org/subgraphs/id/QmUDNRjYZ7XbgTvfVnXHj6LcTNacDD9GPXHWLjdTKi6om6";

class TokenService {
  constructor() {
    this.latestBlock = 0;
  }

  /**
   * Get the number of the last indexed block
   */
  async getLatestBlock() {
    const query = `{
      _meta {
        block {
          number
        }
      }
    }`;
    const r = await this.query({ query });
    const meta = r.data.data._meta;
    this.latestBlock = meta.block.number;
  }

  /**
   *
   * @param {tokens} tokens
   */
  async getInfo({ tokens, pairs, deposits }) {
    if (!this.latestBlock) await this.getLatestBlock();
    const query = `
    {
      bundle(id: 1) {
        ethPrice
      }
      tokens(first: 1000, orderBy: tradeVolume, orderDirection: desc) {
        id
        symbol
        name
        derivedETH
      }
      pairs(first: 1000, orderBy: volumeToken0, orderDirection: desc) {
        id
        reserve0
        reserve1
        token0Price
        token1Price
        totalSupply
        token0 {
          id
          symbol
          name
          derivedETH
        }
        token1 {
          id
          symbol
          name
          derivedETH
        }
      }
    }    
      `;

    const variables = {
      tokens: [...new Set(tokens.map((t) => t.toLowerCase()))],
      pairs: [...new Set(pairs.map((t) => t.toLowerCase()))],
    };

    const r = await this.query({ query, variables });
    const tokenList = r.data.data;
    const ethPrice = tokenList.bundle.ethPrice;
    tokenList.tokens = tokenList.tokens.map((t) => prepareToken(t, ethPrice));
    tokenList.pairs = await Promise.all(
      tokenList.pairs.map(async (p) => {
        p.history = [];
        p.lp = true;
        p.token0 = prepareToken(p.token0, ethPrice);
        p.token1 = prepareToken(p.token1, ethPrice);
        return this.getLPHistory(p, this.getDepositsForPair(p, deposits));
      })
    );
    return tokenList;
  }

  getDepositsForPair(pair, deposits) {
    return deposits.filter(d => isSameAddress(d.contractAddress, pair.id))
  }

  async getLPHistory(pair, deposits) {
    deposits = deposits.filter((d) => d.blockNumber < this.latestBlock);
    if (!deposits.length) return pair;
    let query = "query {";
    deposits.forEach((d) => {
      query += `h${
        d.hash
      }: pair(id: "${d.contractAddress.toLowerCase()}", block: {number: ${Math.min(
        this.latestBlock,
        d.blockNumber
      )}}) {
            totalSupply
            token0Price
            token1Price
            reserve0
            reserve1
          }
          `;
    });
    query += "}";
    return this.query({ query }).then((r) => {
      const data = r.data.data;
      const tokenTxs = deposits.filter((d) =>
        isSameAddress(d.contractAddress, pair.id)
      );
      tokenTxs.forEach((t) => {
        if (data["h" + t.hash]) {
          pair.history.push({ ...data["h" + t.hash], value: t.value });
          delete data["h" + t.hash];
        }
      });
      return pair;
    });
  }

  query(data) {
    return this.post(API_BASE, data);
  }

  /**
   *
   * @param {string} url
   * @param {object} data
   */
  post(url, data) {
    return axios.post(url, data);
  }
}

function getUSDPrice(token, ethPrice) {
  return {
    ...token,
    priceUSD: parseFloat(token.derivedETH) * parseFloat(ethPrice),
  };
}

function prepareToken(token, ethPrice) {
  token = getUSDPrice(token, ethPrice);
  return token;
}

export default new TokenService();
