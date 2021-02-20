import axios from "axios";
import { parseAddress, isSameAddress } from "@/utils";

const API_BASE =
  "https://api.bscgraph.org/subgraphs/id/QmUDNRjYZ7XbgTvfVnXHj6LcTNacDD9GPXHWLjdTKi6om6";

const IMG_BASE =
  "https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/smartchain/assets/";

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
    let historyQuery = "";
    if (deposits) {
      deposits.forEach((d) => {
        if(d.blockNumber > this.latestBlock) return
        historyQuery += `h${
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
    }
    const query = `
      query ($tokens: [String!], $pairs: [String!]){
        bundle(id: 1) {
          ethPrice
        }
        tokens(where: {id_in: $tokens }) {
          id
          symbol
          name
          derivedETH
        }
        pairs(where: {id_in: $pairs }) {
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
    const tokens_1 = r.data.data;
    const ethPrice = tokens_1.bundle.ethPrice;
    tokens_1.tokens = tokens_1.tokens.map((t_2) => prepareToken(t_2, ethPrice));
    tokens_1.pairs = tokens_1.pairs.map((p) => {
      p.history = [];
      const tokenTxs = deposits.filter((d_1) =>
        isSameAddress(d_1.contractAddress, p.id)
      );
      tokenTxs.forEach((t_3) => {
        if (tokens_1["h" + t_3.hash]) {
          p.history.push({ ...tokens_1["h" + t_3.hash], value: t_3.value });
          delete tokens_1["h" + t_3.hash];
        }
      });
      p.lp = true;
      p.token0 = prepareToken(p.token0, ethPrice);
      p.token1 = prepareToken(p.token1, ethPrice);
      return p;
    });
    return tokens_1;
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
  token.image = getTokenImage(token);
  return token;
}

function getTokenImage(token) {
  return IMG_BASE + parseAddress(token.id) + "/logo.png";
}

export default new TokenService();
