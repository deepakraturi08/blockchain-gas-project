const axios = require("axios");

module.exports = {
  getEthPrice: async () => {
    const response = await axios.get(
      "https://api.coingecko.com/api/v3/simple/price?ids=ethereum&vs_currencies=inr"
    );
    return response.data.ethereum.usd;
  },

  convertToEth: async (usdAmount) => {
    const ethPrice = await this.getEthPrice();
    return usdAmount / ethPrice;
  },
};
