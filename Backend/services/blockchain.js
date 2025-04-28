const { ethers } = require("ethers");
const PaymentABI = require("../abis/Payment.json"); // Compiled ABI
require("dotenv").config();

const provider = new ethers.JsonRpcProvider(process.env.BLOCKCHAIN_URL);
const wallet = new ethers.Wallet(process.env.ADMIN_PRIVATE_KEY, provider);
const contract = new ethers.Contract(
  process.env.CONTRACT_ADDRESS,
  PaymentABI,
  wallet
);

// Create a new order payment
const createPaymentOrder = async (orderId, amountInEth) => {
  const tx = await contract.pay(orderId, {
    value: ethers.parseEther(amountInEth.toString()),
  });
  await tx.wait();
};

// Verify payment on-chain
const verifyPayment = async (orderId) => {
  const order = await contract.orders(orderId);
  return order.isPaid;
};

module.exports = { createPaymentOrder, verifyPayment };
