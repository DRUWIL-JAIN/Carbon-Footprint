import React, { useState, useEffect } from 'react';
import Web3 from 'web3';
import { TextField, Button, Select, MenuItem, FormControl } from '@material-ui/core';
import db from "./firebase";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { CONTRACT_ADDRESS } from "../constant"
import useStyles from './style';
import { useNavigate } from 'react-router-dom';


const artifacts = require('../MyToken.json');
const contractABI = artifacts.abi;



const contractAddress = CONTRACT_ADDRESS;


const web3 = new Web3(window.ethereum);
const contract = new web3.eth.Contract(contractABI, contractAddress);



const MintToken = ({ isConnected }) => {
  const classes = useStyles();
  const [blockNumber, setBlockNumber] = useState('');
  const [etherscanLink, setEtherscanLink] = useState('');
  const [txHash, setTxHash] = useState('');
  const [accountAddresses, setAccountAddresses] = useState([]);
  const [walletAddress, setWalletAddress] = useState('');
  const [product, setProduct] = useState('');
  const [allProducts, setAllProducts] = useState([]);
  const [quantity, setQuantity] = useState('');
  const navigate = useNavigate();


  function convertToDigitString(number, digits) {
    // Convert the number to a string
    let numberString = String(number);

    // Pad the string with leading zeros if necessary
    while (numberString.length < digits) {
      numberString = '0' + numberString;
    }
    return numberString;
  }

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {

      //get the token id from data collection
      const docCompanyRef = doc(db, "companies", walletAddress);
      const docSnap = await getDoc(docCompanyRef);


      const docProductRef = doc(db, "products", product);
      const docProductSnap = await getDoc(docProductRef);

      if (docSnap.exists() && docProductSnap.exists()) {

        const tokenId = String(docProductSnap.data().productTokenId) + convertToDigitString(docSnap.data().companyTokenId, 6) + convertToDigitString(0, 14);

        // const receipt = await contract.methods
        //   .mint(walletAddress, tokenId, quantity, '0x00')
        //   .send({ from: window.ethereum.selectedAddress });
        // setBlockNumber(receipt.blockNumber);
        // setTxHash(receipt.transactionHash);
        // setEtherscanLink(`https://sepolia.etherscan.io/tx/${receipt.transactionHash}`);

      }
      else {
        alert("Company or product not registered");
      }
    } catch (error) {
      console.error('Error creating commit:', error);
    }
  };

  const fetchAllProducts = async () => {
    const docRef = doc(db, "companies", walletAddress);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      console.log("Document data:", docSnap.data());
      if (docSnap.data().products) {

        docSnap.data().products.map(async (p) => {
          const docRef = doc(db, "products", p);
          const docSnap = await getDoc(docRef);
          if (docSnap.exists()) {
            console.log("Document data:", docSnap.data());
            setAllProducts((allProducts) => [...allProducts, { ...docSnap.data(), id: p }]);
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


  const handleRedirect = (url) => {
    window.open(url, '_blank');
  };

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



  return (
    <div className={classes.wrapper}>
      <h1>Mint Token</h1>
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
            onClick={fetchAllProducts}
          >
            Fetch Products
          </Button>
        )}
        {allProducts.length > 0 && (
          <>
            <FormControl className={classes.input}>
              <Select
                value={product}
                onChange={(e) => setProduct(e.target.value)}
                displayEmpty
                required
              >
                <MenuItem value='' disabled>Select Product</MenuItem>
                {allProducts.map((p, index) => (
                  <MenuItem value={p.id} key={index}>{p.productName} (Qty: {p.baseQuantity}, Carbon footprint: {p.carbonFootprint})</MenuItem>
                ))}
              </Select>
            </FormControl>
            <TextField
              className={classes.input}
              label="Quantity"
              type="number"
              required
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
            />
          </>
        )}
        <Button
          className={classes.button}
          variant="contained"
          color="primary"
          type="submit"
        >
          Safe Mint
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

export default MintToken;
