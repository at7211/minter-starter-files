import {pinJSONToIPFS} from './pinata.js'

require('dotenv').config();
const alchemyKey = process.env.REACT_APP_ALCHEMY_KEY;
const { createAlchemyWeb3 } = require("@alch/alchemy-web3");
const web3 = createAlchemyWeb3(alchemyKey);

const contractABI = require('../contract-abi.json')
const contractAddress = "0x4C4a07F737Bf57F6632B6CAB089B78f62385aCaE";
window.contract = new web3.eth.Contract(contractABI, contractAddress);

const ETHEREUM_REQUEST_METHOD = {
  ACCOUNTS: 'eth_accounts',
  REQUEST_ACCOUNTS: 'eth_requestAccounts',
  SEND_TRANSACTION: 'eth_sendTransaction',
}

export const connectWallet = async () => {
  if (window.ethereum) {
    try {
      const addressArray = await window.ethereum.request({
        method: ETHEREUM_REQUEST_METHOD.REQUEST_ACCOUNTS,
      });
      const obj = {
        status: "👆🏽 Write a message in the text-field above.",
        address: addressArray[0],
      };
      return obj;
    } catch (err) {
      return {
        address: "",
        status: "😥 " + err.message,
      };
    }
  } else {
    return {
      address: "",
      status: (
        <span>
          <p>
            {" "}
            🦊{" "}
            <a target="_blank" href={`https://metamask.io/download.html`}>
              You must install Metamask, a virtual Ethereum wallet, in your
              browser.
            </a>
          </p>
        </span>
      ),
    };
  }
};

export const getCurrentWalletConnected = async () => {
  if (window.ethereum) {
    try {
      const addressArray = await window.ethereum.request({
        method: ETHEREUM_REQUEST_METHOD.ACCOUNTS,
      });
      if (addressArray.length > 0) {
        return {
          address: addressArray[0],
          status: "👆🏽 Write a message in the text-field above.",
        };
      } else {
        return {
          address: "",
          status: "🦊 Connect to Metamask using the top right button.",
        };
      }
    } catch (err) {
      return {
        address: "",
        status: "😥 " + err.message,
      };
    }
  } else {
    return {
      address: "",
      status: (
        <span>
          <p>
            {" "}
            🦊{" "}
            <a target="_blank" href={`https://metamask.io/download.html`}>
              You must install Metamask, a virtual Ethereum wallet, in your
              browser.
            </a>
          </p>
        </span>
      ),
    };
  }
};

export const mintNFT = async(url, name, description) => {
  //error handling
  if (url.trim() == "" || (name.trim() == "" || description.trim() == "")) {
         return {
             success: false,
             status: "❗Please make sure all fields are completed before minting.",
         }
   }

   //make metadata
   const metadata = {};
   metadata.name = name;
   metadata.image = url;
   metadata.description = description;

   //make pinata call
   const pinataResponse = await pinJSONToIPFS(metadata);
   if (!pinataResponse.success) {
       return {
           success: false,
           status: "😢 Something went wrong while uploading your tokenURI.",
       }
   }
   const tokenURI = pinataResponse.pinataUrl;

   //set up your Ethereum transaction
    const transactionParameters = {
            to: contractAddress, // Required except during contract publications.
            from: window.ethereum.selectedAddress, // must match user's active address.
            'data': window.contract.methods.mintNFT(window.ethereum.selectedAddress, tokenURI).encodeABI()//make call to NFT smart contract
    };

    //sign the transaction via Metamask
    try {
        const txHash = await window.ethereum
            .request({
                method: ETHEREUM_REQUEST_METHOD.SEND_TRANSACTION,
                params: [transactionParameters],
            });
        return {
            success: true,
            status: "✅ Check out your transaction on Etherscan: https://ropsten.etherscan.io/tx/" + txHash
        }
    } catch (error) {
        return {
            success: false,
            status: "😥 Something went wrong: " + error.message
        }

    }
 }