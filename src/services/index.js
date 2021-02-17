import axios from "axios";

let apiBaseUrl = "https://yieldwatch.net/api";

export const fetchData = async (address, platforms) => {
  const reqPlatforms = platforms;
  const sendAddress = address.replace(/\s+/g, "");

  const retData = await axios.get(
    `${apiBaseUrl}/all/${sendAddress}?platforms=${reqPlatforms.join()}`
  );
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
        pancake: retData.data.result["PancakeSwap"],
        street: retData.data.result["StreetSwap"],
        beefy: retData.data.result["BeefyFinance"],
        cream: retData.data.result["CreamFinance"],
        jetfuel: retData.data.result["Jetfuel"],
        venus: retData.data.result["Venus"],
        bDollar: retData.data.result["bDollar"],
        autofarm: retData.data.result["Autofarm"],
        currencies: retData.data.result["currencies"],
      },
    };
  }
};

export const fetchQuotes = async () => {
  const newPrices = await axios.get(
    "https://my-bsc-prices.herokuapp.com/api/prices"
  );
  return newPrices.data;
};
