async function main() {
  const [deployer] = await ethers.getSigners();
  console.log("Deploying contracts with the account:", deployer.address);

  const Payment = await ethers.getContractFactory("Payment");
  const payment = await Payment.deploy();

  // Wait for deployment to complete (newer ethers.js syntax)
  await payment.waitForDeployment();

  // Get the contract address
  console.log("Contract deployed at address:", await payment.getAddress());

  // Optional: Verify everything is working
  console.log("Contract owner:", await payment.owner());
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
