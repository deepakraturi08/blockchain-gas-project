// blockchain/scripts/exportAbi.js
const fs = require("fs");
const path = require("path");

const artifact = require("../artifacts/contracts/Payment.sol/Payment.json");
const abi = artifact.abi;

const backendAbiPath = path.join(__dirname, "../../Backend/abis/Payment.json");

fs.writeFileSync(backendAbiPath, JSON.stringify(abi, null, 2));
console.log("ABI exported to backend");

const frontendAbiPath = path.join(
  __dirname,
  "../../Frontend/src/abis/Payment.json"
);

fs.writeFileSync(frontendAbiPath, JSON.stringify(abi, null, 2));
console.log("ABI exported to frontend");
