import { useState } from "react";
import { ethers } from "ethers";
import WalletConnector from "./WalletConnector";

export default function Payment({ orderId, totalAmount }) {
  const [address, setAddress] = useState("");
  const [txHash, setTxHash] = useState("");

  const handlePayment = async () => {
    if (!window.ethereum) return alert("Install MetaMask!");

    const provider = new ethers.BrowserProvider(window.ethereum);
    const signer = await provider.getSigner();
    const contract = new ethers.Contract(
      process.env.REACT_APP_CONTRACT_ADDRESS,
      require("../../abis/Payment.json"),
      signer
    );

    const tx = await contract.pay(orderId, {
      value: ethers.parseEther(totalAmount.toString()),
    });
    setTxHash(tx.hash);
    await tx.wait();
    alert("Payment confirmed!");
  };

  return (
    <div>
      <WalletConnector onConnected={setAddress} />
      <button onClick={handlePayment} disabled={!address}>
        Pay {totalAmount} ETH
      </button>
      {txHash && <p>Transaction: {txHash}</p>}
    </div>
  );
}
