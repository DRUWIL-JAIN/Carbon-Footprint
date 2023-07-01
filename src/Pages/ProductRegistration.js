import React, { useState, useEffect } from 'react';
import { TextField, Button, makeStyles } from '@material-ui/core';
import Web3 from 'web3';
import db from "./firebase";
import { doc, updateDoc, getDoc, addDoc, collection, arrayUnion } from "firebase/firestore";
import FormControl from '@material-ui/core/FormControl';
import Select from '@material-ui/core/Select';
import MenuItem from '@material-ui/core/MenuItem';

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

const ProductRegistration = () => {
  const classes = useStyles();
  const [productName, setProductName] = useState('');
  const [baseQuantity, setBaseQuantity] = useState('');
  const [carbonFootprint, setCarbonFootprint] = useState('');
  const [accountAddresses, setAccountAddresses] = useState([]);
  const [walletAddress, setWalletAddress] = useState('');


  const handleProductNameChange = (event) => {
    setProductName(event.target.value);
  };

  const handleBaseQuantityChange = (event) => {
    setBaseQuantity(event.target.value);
  };

  const handleCarbonFootprintChange = (event) => {
    setCarbonFootprint(event.target.value);
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
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {

      const me = doc(db, "companies", walletAddress);

      const docRef =  await addDoc(collection(db, "products"), {
        productName: productName,
        baseQuantity: baseQuantity,
        carbonFootprint: carbonFootprint,
      });

      await updateDoc(me, {
        products: arrayUnion(docRef.id),
      }).then(() => {
        console.log("Document successfully updated!");
      }).catch((error) => {
        console.error("Error updating document: ", error);
      });

    } catch (e) {
      console.error("Error updating document: ", e);
    }


    // Reset the form
    setProductName('');
    setBaseQuantity('');
    setCarbonFootprint('');
  };

  return (
    <div className={classes.wrapper}>
      <h1>Product Registration</h1>
      <form onSubmit={handleSubmit} className={classes.form}>
        <TextField
          className={classes.input}
          label="Product Name"
          value={productName}
          onChange={handleProductNameChange}
          required
        />
        <TextField
          className={classes.input}
          label="Base Quantity"
          value={baseQuantity}
          onChange={handleBaseQuantityChange}
          required
        />
        <TextField
          className={classes.input}
          label="Carbon Footprint"
          value={carbonFootprint}
          onChange={handleCarbonFootprintChange}
          required
        />
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
        <Button type="submit" variant="contained" color="primary" className={classes.button}>
          Register Product
        </Button>
      </form>
    </div>
  );
};

export default ProductRegistration;
