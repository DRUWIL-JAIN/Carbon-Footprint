import React, { useState, useEffect } from 'react';
import Web3 from 'web3';
import { TextField, Button, Select, MenuItem, FormControl } from '@material-ui/core';
import db from "./firebase";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import {CONTRACT_ADDRESS} from "../constant"
import useStyles  from './style';
import { useNavigate } from 'react-router-dom';




const artifacts = require('../MyToken.json');
const contractABI = artifacts.abi;
const contractAddress = CONTRACT_ADDRESS;

const web3 = new Web3(window.ethereum);
const contract = new web3.eth.Contract(contractABI, contractAddress);




const AssetTransfer = ({ isConnected }) => {
  const classes = useStyles();
  const [address, setAddress] = useState('');
  const [blockNumber, setBlockNumber] = useState('');
  const [etherscanLink, setEtherscanLink] = useState('');
  const [txHash, setTxHash] = useState('');
  const [accountAddresses, setAccountAddresses] = useState([]);
  const [walletAddress, setWalletAddress] = useState('');
  const [clients, setClients] = useState([]);
  const [client, setClient] = useState('');
  const [quantity, setQuantity] = useState('');
  const navigate = useNavigate();

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
    if(!isConnected) {
      navigate("/");
  }
    fetchAccountAddresses();
  });

  const fetchAllClient = async () => {
    const docRef = doc(db, "companies", walletAddress);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      console.log("Document data:", docSnap.data());
      if(!docSnap.data().clients) {
        alert("No clients registered for this company");
        return;
      }
      if (docSnap.data().clients.length > 0) {
       
        docSnap.data().clients.map(async (p) => {
          const docRef = doc(db, "companies", p);
          const docSnap = await getDoc(docRef);
          if (docSnap.exists()) {
            console.log("Document data:", docSnap.data());
            setClients((clients) => [...clients, {...docSnap.data(), id: p}]);
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

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const receipt = await contract.methods
        .mint(address, '0', '100', '0x00')
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
              <MenuItem value='' disabled>Select Product</MenuItem>
              {clients.map((p, index) => (
                <MenuItem value={p.id} key={index}>{p.companyName}</MenuItem>
              ))}
            </Select>
          </FormControl>
        <TextField
          label="Wallet address to whom the NFT will be transfered"
          value={client}
          onChange={(e) => setAddress(e.target.value)}
          fullWidth
          className={classes.input}
          disabled
          required
        />
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

export default AssetTransfer;