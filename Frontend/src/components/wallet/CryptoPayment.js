import { useState, useEffect } from "react";
import { ethers } from "ethers";
import { toast } from "react-toastify";
import paymentAbi from "../../abis/Payment.json"; // Adjust the path to your ABI file
const REACT_APP_CONTRACT_ADDRESS = "0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512";
const handleWithdrawAsOwner = async () => {
  try {
    const provider = new ethers.BrowserProvider(window.ethereum);
    const paymentContract = new ethers.Contract(
      REACT_APP_CONTRACT_ADDRESS,
      ["function withdraw()", "function owner() view returns (address)"],
      provider
    );

    // 1. Get owner address from contract
    const ownerAddress = await paymentContract.owner();
    console.log("SWITCH TO OWNER HERE");
    // 2. Request MetaMask to switch to owner account
    await window.ethereum.request({
      method: "wallet_requestPermissions",
      params: [{ eth_accounts: {} }],
    });

    // 3. Check if current signer is owner
    const signer = await provider.getSigner();
    const currentSigner = await signer.getAddress();

    if (currentSigner.toLowerCase() !== ownerAddress.toLowerCase()) {
      throw new Error(
        `Please switch MetaMask to owner account: ${ownerAddress}`
      );
    }

    // 4. Execute withdrawal
    const withdrawTx = await paymentContract.connect(signer).withdraw({
      gasLimit: 100000,
    });
    await withdrawTx.wait();
    toast.success("Withdrawal successful!");
  } catch (error) {
    console.error("Withdrawal error:", error);
    toast.error(`Withdrawal failed: ${error.message}`);
  }
};
export default function CryptoPayment({ amount, onSuccess, onClose }) {
  const [isPaying, setIsPaying] = useState(false);
  const [ethAmount, setEthAmount] = useState(null);
  const [currentEthPrice, setCurrentEthPrice] = useState(0);
  const [isLoadingRate, setIsLoadingRate] = useState(true);
  const [error, setError] = useState(null);

  // Fetch ETH conversion rate when component mounts
  useEffect(() => {
    const fetchEthRate = async () => {
      try {
        setIsLoadingRate(true);
        setError(null);
        const [calculatedEth, currentPrice] = await convertToEth(amount);
        setEthAmount(calculatedEth);
        setCurrentEthPrice(currentPrice);
      } catch (err) {
        setError("Failed to get ETH conversion rate");
        console.error(err);
      } finally {
        setIsLoadingRate(false);
      }
    };

    fetchEthRate();
  }, [amount]);
  const handlePayment = async (e) => {
    e.preventDefault();

    try {
      // 1. Force Hardhat network
      await window.ethereum.request({
        method: "wallet_requestPermissions",
        params: [{ eth_accounts: {} }], // 1337
      });

      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();

      // 2. Hardcoded contract details
      const contractAddress = REACT_APP_CONTRACT_ADDRESS;
      const paymentAmount = ethers.parseEther("0.1");
      const orderId = 1; // Using fixed orderId that worked in console

      // 3. Properly encode function data
      const payFunctionSelector = "0xc290d691";
      const paddedOrderId = ethers.zeroPadValue(ethers.toBeHex(orderId), 32);
      const payData = payFunctionSelector + paddedOrderId.slice(2);

      console.log("Encoded pay data:", payData);

      // 4. Send payment
      const payTx = await signer.sendTransaction({
        to: contractAddress,
        data: payData,
        value: paymentAmount,
        gasLimit: 10000000,
        chainId: 1337,
      });

      const payReceipt = await payTx.wait();
      console.log("Payment receipt:", payReceipt);
      const paymentContract = new ethers.Contract(
        REACT_APP_CONTRACT_ADDRESS,
        [
          "function pay(uint256 orderId) payable",
          "function withdraw()",
          "function owner() view returns (address)",
          "function getBalance() view returns (uint256)",
        ],
        signer
      );
      const ownerAddress = await paymentContract.owner();
      console.log("Contract owner:", ownerAddress);

      handleWithdrawAsOwner();

      toast.success("Withdrawal successful!");
    } catch (error) {
      console.error("Full error:", error);
      toast.error(`Transaction failed: ${error.message}`);
    }
  };
  return (
    <div className="p-4">
      <h3 className="text-lg font-bold mb-4">Pay with Crypto</h3>

      <div className="mb-4 space-y-2">
        <p className="font-medium">Order Total: {amount} INR</p>

        {isLoadingRate ? (
          <p className="text-gray-500">Calculating ETH amount...</p>
        ) : error ? (
          <p className="text-red-500">{error}</p>
        ) : (
          <>
            <p className="font-semibold">≈ {ethAmount?.toFixed(6)} ETH</p>
            <p className="font-medium text-orange-500">
              Current price {currentEthPrice} INR / ETH
            </p>
            <p className="text-sm text-gray-500">Rates update automatically</p>
          </>
        )}
      </div>

      <div className="flex gap-2">
        <button
          onClick={onClose}
          className="px-4 py-2 border rounded flex-1"
          disabled={isPaying}
        >
          Cancel
        </button>
        <button
          onClick={handlePayment}
          disabled={isPaying || isLoadingRate || error}
          className={`px-4 py-2 rounded flex-1 ${
            isPaying ? "bg-orange-400" : "bg-orange-500 hover:bg-orange-600"
          } text-white disabled:opacity-50`}
        >
          {isPaying ? (
            <span className="flex items-center justify-center gap-2">
              <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                <circle
                  cx="12"
                  cy="12"
                  r="10"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="4"
                  className="opacity-25"
                />
                <path
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  className="opacity-75"
                />
              </svg>
              Processing...
            </span>
          ) : (
            "Confirm Payment"
          )}
        </button>
      </div>
    </div>
  );
}

// Enhanced conversion function with error handling
async function convertToEth(inrAmount) {
  try {
    // Cache response for 1 minute to avoid rate limiting
    const cacheKey = `eth-inr-rate-${Math.floor(Date.now() / 60000)}`;
    const cachedRate = localStorage.getItem(cacheKey);

    let ethPriceInInr;

    if (cachedRate) {
      ethPriceInInr = parseFloat(cachedRate);
    } else {
      const response = await fetch(
        "https://api.coingecko.com/api/v3/simple/price?ids=ethereum&vs_currencies=inr"
      );

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }

      const data = await response.json();
      ethPriceInInr = data.ethereum?.inr;

      if (!ethPriceInInr) {
        throw new Error("Invalid response format");
      }

      // Cache the rate
      localStorage.setItem(cacheKey, ethPriceInInr.toString());
    }

    const ethAmount = inrAmount / ethPriceInInr;

    // Return both [ETH amount, current ETH price in INR]
    return [ethAmount, ethPriceInInr];
  } catch (error) {
    console.error("Conversion error:", error);
    throw new Error("Could not fetch ETH conversion rate");
  }
}
