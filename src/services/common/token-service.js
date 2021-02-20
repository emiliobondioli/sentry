import axios from "axios";
import { parseAddress, isSameAddress } from "@/utils";

const API_BASE =
  "https://api.bscgraph.org/subgraphs/id/QmUDNRjYZ7XbgTvfVnXHj6LcTNacDD9GPXHWLjdTKi6om6";

const IMG_BASE =
  "https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/smartchain/assets/";

class TokenService {
  getInfo({ tokens, pairs, deposits }) {
    let historyQuery = "";
    if (deposits) {
      deposits.forEach((d) => {
        historyQuery += `h${d.hash}: pair(id: "${d.contractAddress.toLowerCase()}", block: {number: ${d.blockNumber}}) {
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
        ${historyQuery}
      }
      `;

    const variables = {
      tokens: [...new Set(tokens.map(t => t.toLowerCase()))],
      pairs: [...new Set(pairs.map(t => t.toLowerCase()))],
    };

    return this.post(API_BASE, { query, variables }).then((r) => {
      const tokens = r.data.data;
      const ethPrice = tokens.bundle.ethPrice;
      tokens.tokens = tokens.tokens.map((t) => prepareToken(t, ethPrice));
      tokens.pairs = tokens.pairs.map((p) => {
        p.history = [];
        const tokenTxs = deposits.filter((d) =>
        isSameAddress(d.contractAddress, p.id)
        );
        tokenTxs.forEach((t) => {
          if (tokens["h" + t.hash]) {
            p.history.push({ ...tokens["h" + t.hash], value: t.value });
            delete tokens["h" + t.hash];
          }
        });
        p.lp = true;
        p.token0 = prepareToken(p.token0, ethPrice);
        p.token1 = prepareToken(p.token1, ethPrice);
        return p;
      });
      return tokens;
    });
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
