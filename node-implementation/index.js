const Web3 = require("web3");
const contractDef = require("./abi.json");
const abi = contractDef.abi;
const bytecode = `0x${contractDef.object}`;
const endpoint = "http://localhost:8545";
const EEAClient = require("web3-eea");
const CHAINID = 2018;
const web3 = new EEAClient(new Web3(endpoint), CHAINID);
const InputDataDecoder = require("ethereum-input-data-decoder");
const decoder = new InputDataDecoder(abi);
const abiDecoder = require("abi-decoder");
abiDecoder.addABI(abi);
const JWT_TOKEN =
  "ewogICJhbGciOiAibm9uZSIsCiAgInR5cCI6ICJKV1QiCn0.eyJpYXQiOjE1MTYyMzkwMjIsImV4cCI6NDcyOTM2MzIwMCwicGVybWlzc2lvbnMiOlsibmV0OnBlZXJDb3VudCJdfQ";

const providerOptions = {
  timeout: 30000, // ms
  headers: {
    authorization: `Bearer ${JWT_TOKEN}`,
  },
  reconnect: {
    auto: true,
    delay: 5000, // ms
    maxAttempts: 5,
    onTimeout: false,
  },
};

const websocketProvider = new Web3.providers.WebsocketProvider(
  "http://localhost:8546",
  providerOptions
);

const httpProviderOptions = {
  headers: [{ name: "X-My-Custom-Header", value: "some value" }],
};
const httpProvider = new Web3.providers.HttpProvider(
  "http://localhost:8545",
  httpProviderOptions
);
const web3Http = new EEAClient(new Web3(httpProvider), 2018);

const web3Ws = new EEAClient(new Web3(websocketProvider), 2018);
let privateKey =
  "0xc87509a1c067bbde78beb793e6fa76530b6382a4c0241e5e4a9ec0a0f44dc0d3";

let account = "0x627306090abaB3A6e1400e9345bC60c78a8BEf57";
const contractAddress = "0x8CdaF0CD259887258Bc13a92C0a6dA92698644C0";
let incrementer = new web3.eth.Contract(abi, contractAddress);
const adoption = 4;
// const encoded = incrementer.methods.adopt(adoption).encodeABI();
const scrappedBlock = 0;
// Deploy contract
const deploy = async () => {
  console.log("Attempting to deploy from account:", account);
  await web3.eth.accounts.wallet.add(privateKey);
  incrementer = new web3.eth.Contract(abi);

  const incrementerTx = incrementer.deploy({
    data: bytecode,
  });

  const createTransaction = await web3.eth.accounts.signTransaction(
    {
      from: account,
      data: incrementerTx.encodeABI(),
      gas: await incrementerTx.estimateGas(),
    },
    privateKey
  );

  const createReceipt = await web3.eth.sendSignedTransaction(
    createTransaction.rawTransaction
  );
  console.log("Contract deployed at address", createReceipt);
};

const adopt = async () => {
  console.log(
    `Calling adopt function in contract at address ${contractAddress}`
  );

  const createTransaction = await web3.eth.accounts.signTransaction(
    {
      from: account,
      to: contractAddress,
      data: encoded,
      gas: 80000,
    },
    privateKey
  );

  const createReceipt = await web3.eth.sendSignedTransaction(
    createTransaction.rawTransaction
  );
  console.log(`Tx successfull with hash: ${createReceipt.transactionHash}`);
};

const adopters = async () => {
  console.log(`Making a call to contract at address ${contractAddress}`);
  const data = await incrementer.methods.adopters(adoption).call();
  console.log(`The current number stored is: ${data}`);
};

const storage = async () => {
  web3.eth
    .getStorageAt("0x345ca3e014aaf5dca488057592ee47305d9b3e10", 0)
    .then((count) => {
      console.log("Current count: " + web3.utils.hexToAscii(count));
    });
};

const filter = async () => {
  web3Ws.eth
    .subscribe("newBlockHeaders", function (error, result) {
      if (!error) console.log(result);
    })
    .on("data", function (log) {
      console.log("data");
      console.log(log);
    })
    .on("changed", function (log) {
      // console.log(log);
    });
};

const scrapBlock = async () => {
  try {
    const blockNumber = await web3.eth.getBlockNumber();
    console.debug(
      `Inside scrapBlock()=> Current Block Number Found : ${blockNumber}`
    );

    if (blockNumber > scrappedBlock) {
      for (let i = scrappedBlock + 1; i <= blockNumber; i++) {
        const count = await web3.eth.getBlockTransactionCount(i);
        if (count > 0) {
          const block = await web3.eth.getBlock(i);
          await block.transactions.map(async (tx) => {
            const receipt = await web3.eth.getTransactionReceipt(tx);
            const newTx = {
              contractAddress:
                receipt.to == null ? receipt.contractAddress : receipt.to,
              blockNumber: receipt.blockNumber,
              txhash: receipt.transactionHash,
              fromAddress: receipt.from,
              txType: receipt.to == null ? "Contract Creation" : "Transaction",
              gasUsed: receipt.gasUsed,
              createdAt: new Date(block.timestamp * 1000),
            };
            const txResult = await web3.eth.getTransaction(newTx.txhash);
            const result = decoder.decodeData(txResult.input);
            newTx.params = result;
            console.log(newTx);
            return newTx;
          });
        }
      }
    }
  } catch (error) {
    console.error(
      `Inside scrapBlock()=> Error occurred with description ${error.stack}`
    );
  }
};

const createAccount = async () => {
  let account = await web3.eth.accounts.create();
  console.log(account);
};

async function isUnlocked() {
  try {
    await web3.eth.sign("", account);
  } catch (e) {
    return false;
  }
  return true;
}
// deploy();

// adopt();

// adopters();

// storage();

// filter();

// scrapBlock();

createAccount();
// isUnlocked().then(console.log).catch(console.error);
