import axios from "axios";

let apiBaseUrl = "https://yieldwatch.net/api";

export const fetchData = async (address, platforms) => {
  console.log("Fetching data");
  let startTime = Date.now();

  const reqPlatforms = platforms;

  /*     if (platforms[i++]) reqPlatforms.push("beefy");
    if (platforms[i++]) reqPlatforms.push("pancake");
    if (platforms[i++]) reqPlatforms.push("streetswap");
    if (platforms[i++]) reqPlatforms.push("bdollar");
    if (platforms[i++]) reqPlatforms.push("jetfuel");
    if (platforms[i++]) reqPlatforms.push("auto");
    if (platforms[i++]) reqPlatforms.push("venus");
    if (platforms[i++]) reqPlatforms.push("cream"); */

  // remove whitespaces
  const sendAddress = address.replace(/\s+/g, "");

  // const retData = await axios.get(`${apiBaseUrl}/all/${sendAddress}?platforms=${reqPlatforms.join().concat(',auto')}`)
  const retData = await axios.get(
    `${apiBaseUrl}/all/${sendAddress}?platforms=${reqPlatforms.join()}`
  );

  // console.log('RETVAL', retData.data)

  let timeDiff = Date.now() - startTime;
  console.log(timeDiff);

  if (
    retData.data.status === "1" &&
    retData.data.result["PancakeSwap"] &&
    retData.data.result["PancakeSwap"] != null &&
    retData.data.result["StreetSwap"] &&
    retData.data.result["StreetSwap"] != null &&
    retData.data.result["BeefyFinance"] &&
    retData.data.result["BeefyFinance"] != null &&
    retData.data.result["CreamFinance"] &&
    retData.data.result["CreamFinance"] != null &&
    retData.data.result["Jetfuel"] &&
    retData.data.result["Jetfuel"] != null &&
    retData.data.result["Venus"] &&
    retData.data.result["Venus"] != null &&
    retData.data.result["bDollar"] &&
    retData.data.result["bDollar"] != null &&
    retData.data.result["Autofarm"] &&
    retData.data.result["Autofarm"] != null &&
    retData.data.result["currencies"] &&
    retData.data.result["currencies"] != null
  ) {
    return {
      data: {
        pancakeData: retData.data.result["PancakeSwap"],
        streetData: retData.data.result["StreetSwap"],
        beefyData: retData.data.result["BeefyFinance"],
        creamData: retData.data.result["CreamFinance"],
        jetfuelData: retData.data.result["Jetfuel"],
        venusData: retData.data.result["Venus"],
        bDollarData: retData.data.result["bDollar"],
        autofarmData: retData.data.result["Autofarm"],
        currencies: retData.data.result["currencies"]
        // walletBalance: retData.data.result['walletBalance'],
      },
    };
  }
};

export const fetchQuotes = async () => {
  const newPrices = await axios.get(
    "https://my-bsc-prices.herokuapp.com/api/prices"
  );
  // console.log(newPrices)
  return newPrices.data;
};
