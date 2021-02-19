import axios from "axios";

const API_BASE =
  "https://api.bscgraph.org/subgraphs/id/QmUDNRjYZ7XbgTvfVnXHj6LcTNacDD9GPXHWLjdTKi6om6";

class TokenService {
  getInfo({ tokens, pairs }) {
    const query = `
      query ($tokens: [String!], $pairs: [String!]){
        tokens(where: {id_in: $tokens }) {
          id
          symbol
          name
          tokenDayData(first: 1, orderBy: date, orderDirection: desc) {
            dailyVolumeToken
            dailyVolumeUSD
            totalLiquidityToken
            totalLiquidityUSD
            priceUSD
          }
        }
        pairs(where: {id_in: $pairs }) {
          id
          token0 {
            id
            symbol
            name
            tokenDayData(first: 1, orderBy: date, orderDirection: desc) {
              dailyVolumeToken
              dailyVolumeUSD
              totalLiquidityToken
              totalLiquidityUSD
              priceUSD
            }
          }
          token1 {
            id
            symbol
            name
            tokenDayData(first: 1, orderBy: date, orderDirection: desc) {
              dailyVolumeToken
              dailyVolumeUSD
              totalLiquidityToken
              totalLiquidityUSD
              priceUSD
            }
          }
        }
      }
      `;
    const variables = {
      tokens,
      pairs,
    };
    return this.post(API_BASE, { query, variables });
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

export default new TokenService();
