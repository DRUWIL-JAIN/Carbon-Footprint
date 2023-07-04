import React, { useState, useEffect } from 'react';
import { TextField, Button, Select, MenuItem, FormControl } from '@material-ui/core';
import Web3 from 'web3';
import db from "./firebase";
import { doc, updateDoc, getDoc, addDoc, collection, arrayUnion } from "firebase/firestore";
import useStyles from './style';
import { useNavigate } from 'react-router-dom';


const ProductRegistration = ({ isConnected }) => {
  const classes = useStyles();
  const [productName, setProductName] = useState('');
  const [baseQuantity, setBaseQuantity] = useState('');
  const [weight, setWeight] = useState('');
  const [carbonFootprint, setCarbonFootprint] = useState('');
  const [accountAddresses, setAccountAddresses] = useState([]);
  const [walletAddress, setWalletAddress] = useState('');
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
    if (!isConnected) {
      navigate("/");
    }

    fetchAccountAddresses();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {

      const docCompanyRef = doc(db, "companies", walletAddress);
      const docCompanySnap = await getDoc(docCompanyRef);
      if (!docCompanySnap.exists()) {
        alert("Company not registered");
        return;
      }
      else {
        

        const docRef = await addDoc(collection(db, "products"), {
          productName: productName,
          baseQuantity: baseQuantity,
          carbonFootprint: carbonFootprint,
          companyAddress: walletAddress,
          weight: weight,
        });

        await updateDoc(docCompanyRef, {
          products: arrayUnion(docRef.id),
        }).then(() => {
          console.log("Document successfully updated!");
        }).catch((error) => {
          console.error("Error updating document: ", error);
        });
      }

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
          onChange={e => setProductName(e.target.value)}
          required
        />
        <TextField
          className={classes.input}
          label="Base Quantity"
          value={baseQuantity}
          onChange={e => setBaseQuantity(e.target.value)}
          required
        />
        <TextField
          className={classes.input}
          label="Weight in Kgs"
          value={weight}
          type='number'
          step='0.01'
          onChange={e => setWeight(e.target.value)}
          required
        />
        <TextField
          className={classes.input}
          label="Carbon Footprint"
          value={carbonFootprint}
          type='number'
          step='0.01'
          onChange={e => setCarbonFootprint(e.target.value)}
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
