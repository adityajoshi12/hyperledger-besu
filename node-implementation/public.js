const Web3 = require("web3");
const contractDef = require("./abi.json");
const abi = contractDef.abi;
const bytecode = `0x${contractDef.object}`;
const endpoint = "http://localhost:8545";
const EEAClient = require("web3-eea");
const CHAINID = 2018;
const { orion, besu } = require("./keys.js");
const url = besu.member2.url;

const web3 = new EEAClient(new Web3(url), CHAINID);

let privateKey =
  "0x885e99a5498f21fbaceca71e2cbc98729eaedeb18682868bf613610f772addad";

let account = "0x3542188d78013FA03142A1F7a4dd31F679672933";

async function deploy() {
  try {
    let incrementer = new web3.eth.Contract(abi);
    const incrementerTx = incrementer.deploy({
      data: bytecode,
    });
    let gas = (await incrementerTx.estimateGas()) * 10;
    console.log(gas);
    const createTransaction = await web3.eth.accounts.signTransaction(
      {
        from: account,
        data: incrementerTx.encodeABI(),
        gas,
      },
      privateKey
    );

    const createReceipt = await web3.eth.sendSignedTransaction(
      createTransaction.rawTransaction
    );
    console.log(createReceipt);
  } catch (error) {
    console.error(error);
  }
}

// deploy();

async function read(contractAddress) {
  let incrementer = new web3.eth.Contract(abi, contractAddress);
  const data = await incrementer.methods.value().call();
  console.log(data);
}

read("0x449260929e0Ce628138446532c4e4DfcdA878802");
