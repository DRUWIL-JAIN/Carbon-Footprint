import React, { useState, useEffect } from 'react';
import Web3 from 'web3';
import { TextField, Button, Select, MenuItem, FormControl } from '@material-ui/core';
import db from "./firebase";
import { doc, query, getDoc, where, getDocs, collection } from "firebase/firestore";
import { CONTRACT_ADDRESS } from "../constant"
import useStyles from './style';
import { useNavigate } from 'react-router-dom';






const artifacts = require('../MyToken.json');
const contractABI = artifacts.abi;
const contractAddress = CONTRACT_ADDRESS;

const web3 = new Web3(window.ethereum);
const contract = new web3.eth.Contract(contractABI, contractAddress);




const AssetTransfer = ({ isConnected }) => {
  const classes = useStyles();
  const [blockNumber, setBlockNumber] = useState('');
  const [etherscanLink, setEtherscanLink] = useState('');
  const [txHash, setTxHash] = useState('');
  const [accountAddresses, setAccountAddresses] = useState([]);
  const [walletAddress, setWalletAddress] = useState('');
  const [clients, setClients] = useState([]);
  const [client, setClient] = useState('');
  const [quantity, setQuantity] = useState('');
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [product, setProduct] = useState(null);


  useEffect(() => {
    const fetchAccountAddresses = async () => {
      if (window.ethereum) {
        try {
          // Request access to the user's accounts
          await window.ethereum.enable();

          // Get the selected Ethereum provider
          const provider = window.ethereum;

          // Create a web3 instance using the provider
          const web3 = new Web3(provider);

          // Get the current user's account addresses
          const accounts = await web3.eth.getAccounts();

          setAccountAddresses(accounts);
        } catch (error) {
          console.error('Error fetching account addresses:', error);
        }
      }
    };
    if (!isConnected) {
      navigate("/");
    }
    fetchAccountAddresses();
  });

  const fetchAllClient = async () => {
    const docRef = doc(db, "companies", walletAddress);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      console.log("Document data:", docSnap.data());
      if (!docSnap.data().clients) {
        alert("No clients registered for this company");
        return;
      }
      if (docSnap.data().clients.length > 0) {

        docSnap.data().clients.map(async (p) => {
          const docRef = doc(db, "companies", p);
          const docSnap = await getDoc(docRef);
          if (docSnap.exists()) {
            console.log("Document data:", docSnap.data());
            setClients((clients) => [...clients, { ...docSnap.data(), id: p }]);
          }
        })
      }
      else {
        alert("No products registered for this company");
      }

    } else {
      // doc.data() will be undefined in this case
      console.log("No such document!");
    }
  }

  function convertToDigitString(number, digits) {
    // Convert the number to a string
    let numberString = String(number);

    // Pad the string with leading zeros if necessary
    while (numberString.length < digits) {
      numberString = '0' + numberString;
    }
    return numberString;
  }

  const fetchProduct = async () => {
    const xhr = new XMLHttpRequest();
    xhr.open("GET", "https://deep-index.moralis.io/api/v2/"+walletAddress+"/nft?chain=sepolia&format=decimal&media_items=false");
    xhr.setRequestHeader("accept", "application/json");
    xhr.setRequestHeader("X-API-Key", "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJub25jZSI6ImQ3NWMwZWNkLTA0NWQtNGU0Yy05NmY2LTg0NTljZmZkZjJmNiIsIm9yZ0lkIjoiMzQ2MzI1IiwidXNlcklkIjoiMzU2MDA1IiwidHlwZUlkIjoiYjkxZDk0YTYtMDdmZS00NjgwLTlkOWItZmJlNTEyZjliOGYwIiwidHlwZSI6IlBST0pFQ1QiLCJpYXQiOjE2ODgyODI0NjUsImV4cCI6NDg0NDA0MjQ2NX0.ZeKB90GPvHv947vltLHWtNnAu_ubOoKFIMwpt6fg5k4");
    xhr.onload = function () {
      if (xhr.status === 200) {
        const response = JSON.parse(xhr.responseText);
        console.log(response.result);
        var productFound = false;
        response.result.map(async (p) => {
          if ((p.token_address).toString() == '0xe1c30162d691da91f8c1983f2f6818e7df92a976') {
            console.log("Product found");
            productFound = true;
            const productTokenId = parseInt(convertToDigitString(p.token_id, 24).slice(0, 4));
            console.log(productTokenId);
            const collectionProductRef = collection(db, "products");
            const productQuery = query(collectionProductRef, where("productTokenId", "==", productTokenId), where("companyAddress", "==", walletAddress));
            const querySnapshot = await getDocs(productQuery);
            console.log(querySnapshot);
            querySnapshot.forEach((doc) => {
              console.log(doc.id, " => ", doc.data());
              setProducts((products) => [...products, { ...doc.data(), amount: p.amount, token_id: p.token_id }]);
            });

          }
        })
        if (!productFound) {
          alert("No products minted");
        }
      } else {
        console.log(xhr.status);
      }
    };
    xhr.send();
  }

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const receipt = await contract.methods
        .mint(client, '0', '100', '0x00')
        .send({ from: window.ethereum.selectedAddress });
      setBlockNumber(receipt.blockNumber);
      setTxHash(receipt.transactionHash);
      setEtherscanLink(`https://sepolia.etherscan.io/tx/${receipt.transactionHash}`);
    } catch (error) {
      console.error('Error creating commit:', error);
    }
  };

  const handleRedirect = (url) => {
    window.open(url, '_blank');
  };

  return (
    <div className={classes.wrapper}>
      <h1>Asset Transfer</h1>
      <form onSubmit={handleSubmit} className={classes.form}>
        <FormControl className={classes.input}>
          <Select
            value={walletAddress}
            onChange={(e) => setWalletAddress(e.target.value)}
            displayEmpty
            required
          >
            <MenuItem value='' disabled>Select account address</MenuItem>
            {accountAddresses.map((address, index) => (
              <MenuItem value={address} key={index}>{address}</MenuItem>
            ))}
          </Select>
        </FormControl>
        {walletAddress && (
          <Button
            className={classes.button}
            variant="contained"
            color="primary"
            onClick={fetchAllClient}
          >
            Fetch clients
          </Button>
        )}
        {clients.length > 0 && (
          <>
            <FormControl className={classes.input}>
              <Select
                value={client}
                onChange={(e) => setClient(e.target.value)}
                displayEmpty
                required
              >
                <MenuItem value='' disabled>Select Client</MenuItem>
                {clients.map((p, index) => (
                  <MenuItem value={p.id} key={index}>{p.companyName}</MenuItem>
                ))}
              </Select>
            </FormControl>
            <TextField
              label="Wallet address to whom the NFT will be transfered"
              value={client}
              fullWidth
              className={classes.input}
              disabled
              required
            />
            <Button
              className={classes.button}
              variant="contained"
              color="primary"
              onClick={fetchProduct}
            >
              Fetch Products
            </Button>
            {products.length > 0 && (
              <>
                <FormControl className={classes.input}>
                  <Select
                    value={product ? product : ''}
                    onChange={(e) => setProduct(e.target.value)}
                    displayEmpty
                    required
                  >
                    <MenuItem value='' disabled>Select Product</MenuItem>
                    {products.map((p, index) => (
                      <MenuItem value={p} key={index}>{p.productName} ({p.baseQuantity})</MenuItem>
                    ))}
                  </Select>
                </FormControl>

                <TextField
                  label="Product Token Id"
                  value={product ? product.token_id : ''}
                  fullWidth
                  className={classes.input}
                  disabled
                  required
                />
                {product && (

                  <TextField
                    label={"Product Amount (available: "+ product.amount+")"}
                    value={quantity}
                    onChange={(e) => setQuantity(e.target.value)}
                    fullWidth
                    className={classes.input}
                    required
                    type="number"
                    InputProps={{
                      inputProps: {
                        max: product.amount, min: 10
                      }
                    }}
                  />
                )}
              </>
            )}
          </>
        )}
        <Button
          className={classes.button}
          variant="contained"
          color="primary"
          type="submit"
        >
          Safe Transfer
        </Button>
      </form>
      {blockNumber && (
        <div>
          <div>
            <span>blockNumber: {blockNumber ? blockNumber : 'Waiting...'}</span>
          </div>
          <div>
            <span>txHash: {txHash ? txHash : 'Waiting...'}</span>
          </div>
          <div>
            <span>View on Etherscan: {etherscanLink}</span>
            <Button
              variant="contained"
              color="primary"
              onClick={() => handleRedirect(etherscanLink)}
            >
              {txHash ? 'Redirect' : 'Waiting...'}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AssetTransfer;
