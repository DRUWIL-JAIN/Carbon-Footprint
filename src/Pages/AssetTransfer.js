import React, { useState } from 'react';
import Web3 from 'web3';
import { makeStyles } from '@material-ui/core/styles';
import Button from '@material-ui/core/Button';
import TextField from '@material-ui/core/TextField';
require("dotenv").config();
const { CONTRACT_ADDRESS } = process.env;



const artifacts = require('../MyToken.json');
const contractABI = artifacts.abi;
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
  },
  input: {
    marginBottom: theme.spacing(2),
  },
  button: {
    marginTop: theme.spacing(2),
  },
}));

const AssetTransfer = () => {
  const classes = useStyles();
  const [address, setAddress] = useState('');
  const [blockNumber, setBlockNumber] = useState('');
  const [etherscanLink, setEtherscanLink] = useState('');
  const [txHash, setTxHash] = useState('');

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
        <TextField
          label="Wallet address to whom the NFT will be minted"
          value={address}
          onChange={(e) => setAddress(e.target.value)}
          fullWidth
          className={classes.input}
          required
        />
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
