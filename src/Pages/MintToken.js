import React, { useState, useEffect } from 'react';
import Web3 from 'web3';
import { makeStyles } from '@material-ui/core/styles';
import Button from '@material-ui/core/Button';
import TextField from '@material-ui/core/TextField';
import FormControl from '@material-ui/core/FormControl';
import Select from '@material-ui/core/Select';
import MenuItem from '@material-ui/core/MenuItem';
import db from "./firebase";
import { doc, getDoc } from "firebase/firestore";

const artifacts = require('../MyToken.json');
const contractABI = artifacts.abi;
require("dotenv").config();
const { CONTRACT_ADDRESS } = process.env;
const contractAddress = CONTRACT_ADDRESS;

const web3 = new Web3(window.ethereum);
const contract = new web3.eth.Contract(contractABI, contractAddress);


const useStyles = makeStyles((theme) => ({
  wrapper: {
    textAlign: 'center',
    padding: theme.spacing(4),
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    maxWidth: '400px',
    margin: '0 auto',
    textAlign: 'left',
  },
  input: {
    marginBottom: theme.spacing(2),
  },
  button: {
    marginBottom: theme.spacing(2),
  },

}));

const MintToken = () => {
  const classes = useStyles();
  const [blockNumber, setBlockNumber] = useState('');
  const [etherscanLink, setEtherscanLink] = useState('');
  const [txHash, setTxHash] = useState('');
  const [accountAddresses, setAccountAddresses] = useState([]);
  const [walletAddress, setWalletAddress] = useState('');
  const [product, setProduct] = useState('');
  const [allProducts, setAllProducts] = useState([]);
  const [quantity, setQuantity] = useState('');
  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const receipt = await contract.methods
        .mint(walletAddress, '0', quantity, '0x00')
        .send({ from: window.ethereum.selectedAddress });
      setBlockNumber(receipt.blockNumber);
      setTxHash(receipt.transactionHash);
      setEtherscanLink(`https://sepolia.etherscan.io/tx/${receipt.transactionHash}`);
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
            setAllProducts((allProducts) => [...allProducts, {...docSnap.data(), id: p}]);
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
                <MenuItem value={p.id} key={index}>{p.productName}</MenuItem>
              ))}
            </Select>
          </FormControl>
          <TextField
            className={classes.input}
            label="Quantity"
            variant="outlined"
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
