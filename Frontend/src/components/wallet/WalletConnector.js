import { useState } from "react";
import { ethers } from "ethers";

export default function WalletConnector({ onConnected }) {
  const [connected, setConnected] = useState(false);

  const connectWallet = async () => {
    if (window.ethereum) {
      const provider = new ethers.BrowserProvider(window.ethereum);
      await provider.send("eth_requestAccounts", []);
      const signer = await provider.getSigner();
      onConnected(signer.address);
      setConnected(true);
    } else {
      alert("Install MetaMask!");
    }
  };

  return (
    <button onClick={connectWallet}>
      {connected ? "Connected" : "Connect MetaMask"}
    </button>
  );
}
