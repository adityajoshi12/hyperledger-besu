const Web3 = require("web3");
const CHAINID = 1981;
const endpoint = "http://localhost:8545";
const EEAClient = require("web3-eea");
const { orion, besu } = require("./keys.js");
const url = besu.member1.url;
const web3 = new EEAClient(new Web3(url), CHAINID);
const contractDetails = require("./abi.json");
const abi = contractDetails.abi;
const bytecode = contractDetails.object;

const createPrivacyGroupForNode123 = () => {
  const contractOptions = {
    addresses: [
      orion.member1.publicKey,
      orion.member2.publicKey,
      orion.member3.publicKey,
    ],
    name: "three nodes",
    description: "test",
  };
  console.log("privacy");
  return web3.priv.createPrivacyGroup(contractOptions).then((result) => {
    console.log(`The privacy group created is:`, result);
    return result;
  });
};

const createPrivacyGroupForNode23 = () => {
  const web3 = new EEAClient(new Web3(besu.member2.url), CHAINID);
  const contractOptions = {
    addresses: [orion.member2.publicKey, orion.member3.publicKey],
    name: "two nodes 2-3",
    description: "test",
  };
  console.log("privacy");
  return web3.priv.createPrivacyGroup(contractOptions).then((result) => {
    console.log(`The privacy group created is:`, result);
    return result;
  });
};

const createPrivacyGroupForNode12 = () => {
  const contractOptions = {
    addresses: [orion.member1.publicKey, orion.member2.publicKey],
    name: "two nodes",
    description: "test",
  };
  console.log("privacy");
  return web3.priv.createPrivacyGroup(contractOptions).then((result) => {
    console.log(`The privacy group created is:`, result);
    return result;
  });
};

const findPrivacyGroupForNode123 = () => {
  const contractOptions = {
    addresses: [
      orion.member1.publicKey,
      orion.member2.publicKey,
      orion.member3.publicKey,
    ],
  };
  return web3.priv.findPrivacyGroup(contractOptions).then((result) => {
    console.log(`The privacy groups found are:`, result);
    return result;
  });
};
const findPrivacyGroupForNode12 = () => {
  const contractOptions = {
    addresses: [orion.member1.publicKey, orion.member2.publicKey],
  };
  return web3.priv.findPrivacyGroup(contractOptions).then((result) => {
    console.log(`The privacy groups found are:`, result);
    return result;
  });
};

const findPrivacyGroupForNode23 = () => {
  const contractOptions = {
    addresses: [orion.member2.publicKey, orion.member3.publicKey],
  };
  return web3.priv.findPrivacyGroup(contractOptions).then((result) => {
    console.log(`The privacy groups found are:`, result);
    return result;
  });
};

const createPrivateContract = (privacyGroupId) => {
  const contractOptions = {
    data: `0x${bytecode}`,
    privateFrom: orion.member1.publicKey,
    privacyGroupId: privacyGroupId,
    privateKey: besu.member1.privateKey,
  };
  return web3.eea.sendRawTransaction(contractOptions);
};

const createPrivateContract23 = (privacyGroupId) => {
  const web3 = new EEAClient(new Web3(besu.member2.url), CHAINID);
  const contractOptions = {
    data: `0x${bytecode}`,
    privateFrom: orion.member2.publicKey,
    privacyGroupId: privacyGroupId,
    privateKey: besu.member2.privateKey,
  };
  return web3.eea.sendRawTransaction(contractOptions);
};

const getPrivateContractAddress = (transactionHash) => {
  const web3 = new EEAClient(new Web3(besu.member2.url), CHAINID);
  console.log("Transaction Hash ", transactionHash);
  return web3.priv
    .getTransactionReceipt(transactionHash, orion.member2.publicKey)
    .then((privateTransactionReceipt) => {
      console.log("Private Transaction Receipt\n", privateTransactionReceipt);

      return privateTransactionReceipt.contractAddress;
    });
};

const storeValueFromNode1 = (address, value, privacyGroupId) => {
  const contract = new web3.eth.Contract(abi);

  // eslint-disable-next-line no-underscore-dangle
  const functionAbi = contract._jsonInterface.find((e) => {
    return e.name === "store";
  });
  const functionArgs = web3.eth.abi
    .encodeParameters(functionAbi.inputs, [value])
    .slice(2);

  const functionCall = {
    to: address,
    data: functionAbi.signature + functionArgs,
    privateFrom: orion.member1.publicKey,
    privacyGroupId,
    privateKey: besu.member1.privateKey,
  };
  return web3.eea
    .sendRawTransaction(functionCall)
    .then((transactionHash) => {
      console.log("Transaction Hash:", transactionHash);
      return web3.priv.getTransactionReceipt(
        transactionHash,
        orion.member1.publicKey
      );
    })
    .then((result) => {
      console.log("Event Emitted:", result.logs[0].data);
      return result;
    });
};

const storeValueFromNode23 = (address, value, privacyGroupId) => {
  const web3 = new EEAClient(new Web3(besu.member2.url), CHAINID);
  const contract = new web3.eth.Contract(abi);

  const functionAbi = contract._jsonInterface.find((e) => {
    return e.name === "store";
  });
  const functionArgs = web3.eth.abi
    .encodeParameters(functionAbi.inputs, [value])
    .slice(2);

  const functionCall = {
    to: address,
    data: functionAbi.signature + functionArgs,
    privateFrom: orion.member2.publicKey,
    privacyGroupId,
    privateKey: besu.member2.privateKey,
  };
  return web3.eea
    .sendRawTransaction(functionCall)
    .then((transactionHash) => {
      console.log("Transaction Hash:", transactionHash);
      return web3.priv.getTransactionReceipt(
        transactionHash,
        orion.member1.publicKey
      );
    })
    .then((result) => {
      console.log("Event Emitted:", result.logs[0].data);
      return result;
    });
};

const getValue = (url, address, privateFrom, privacyGroupId, privateKey) => {
  const web3 = new EEAClient(new Web3(url), CHAINID);
  const contract = new web3.eth.Contract(abi);

  // eslint-disable-next-line no-underscore-dangle
  const functionAbi = contract._jsonInterface.find((e) => {
    return e.name === "value";
  });

  const functionCall = {
    to: address,
    data: functionAbi.signature,
    privateFrom,
    privacyGroupId,
    privateKey,
  };

  return web3.eea
    .sendRawTransaction(functionCall)
    .then((transactionHash) => {
      return web3.priv.getTransactionReceipt(
        transactionHash,
        orion.member1.publicKey
      );
    })
    .then((result) => {
      console.log(`GOT Value from ${url}:`, result.output);
      return result;
    });
};

const getValueFromNode1 = (address, privacyGroupId) => {
  console.log("getValueFromNode1");
  return getValue(
    besu.member1.url,
    address,
    orion.member1.publicKey,
    privacyGroupId,
    besu.member1.privateKey
  );
};

const getValueFromNode2 = (address, privacyGroupId) => {
  console.log("getValueFromNode2");
  return getValue(
    besu.member2.url,
    address,
    orion.member2.publicKey,
    privacyGroupId,
    besu.member2.privateKey
  );
};

const getValueFromNode3 = (address, privacyGroupId) => {
  console.log("getValueFromNode3");
  console.log(`EXPECTING AN ERROR: GETTING Value from: ${besu.member3.url}`);
  return getValue(
    besu.member3.url,
    address,
    orion.member3.publicKey,
    privacyGroupId,
    besu.member3.privateKey
  );
};
// 1-2
let address = "0x3a30c19a0957e3175eeed4cb124567b10e17ea76";
let privacyGroupId = "ssb8eH3/Df6INluMvT5YTUUZGSgIcAsGa+oTa7g6dmQ=";

// createPrivacyGroupForNode123();
// createPrivacyGroupForNode12();
// createPrivacyGroupForNode23();
// findPrivacyGroupForNode123();
// findPrivacyGroupForNode12();
// findPrivacyGroupForNode23();
// DEPLOY ON 1-2
// createPrivateContract("ssb8eH3/Df6INluMvT5YTUUZGSgIcAsGa+oTa7g6dmQ=")
//   .then(getPrivateContractAddress)
//   .catch(console.error);

// DPLOY ON 2-3
// createPrivateContract23("nkfJXCwZzV64Q25oEWXsy2U+1aMRP8eBH9ONEit7eqI=")
//   .then(console.log)
//   .catch(console.error);

// getPrivateContractAddress(
//   "0x71953a2665b86f8017cc6a72b00f1240bd06c533ce947de0b44513d3863ac9da"
// );

// storeValueFromNode1(address, 2000, privacyGroupId)
//   .then(() => {
//     return getValueFromNode1(address, privacyGroupId);
//   })
//   .then(() => {
//     return getValueFromNode2(address, privacyGroupId);
//   })
//   .then(() => {
//     //return getValueFromNode3(address, privacyGroupId);
//   })
//   .catch(console.log);
// 2-3
// address = "0xa6ab7fb82728cd240055b88ee97062b5b9b1efc1";
// privacyGroupId = "nkfJXCwZzV64Q25oEWXsy2U+1aMRP8eBH9ONEit7eqI=";

// storeValueFromNode23(address, 2000, privacyGroupId)
//   .then(() => {
//     return getValueFromNode2(address, privacyGroupId);
//   })
//   .then(() => {
//     return getValueFromNode3(address, privacyGroupId);
//   })
//   .catch(console.log);

// getValueFromNode3(address, privacyGroupId);

async function createAccount() {
  var account = await web3.eth.accounts.create();
  console.log(account);
}

// createAccount();
