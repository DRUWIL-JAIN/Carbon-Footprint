import React, { useState, useEffect } from 'react';
import { TextField, Button, Select, MenuItem, FormControl, Checkbox, FormControlLabel, Input } from '@material-ui/core';
import Web3 from 'web3';
import { db, storage } from "./firebase";
import { doc, updateDoc, getDoc, addDoc, collection, arrayUnion } from "firebase/firestore";
import useStyles from './style';
import { useNavigate } from 'react-router-dom';
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";


const ProductRegistration = ({ isConnected }) => {
  const classes = useStyles();
  const [productName, setProductName] = useState('');
  const [description, setDescription] = useState('');
  const [weight, setWeight] = useState('');
  const [carbonFootprint, setCarbonFootprint] = useState('');
  const [accountAddresses, setAccountAddresses] = useState([]);
  const [walletAddress, setWalletAddress] = useState('');
  const [isRawMaterial, setIsRawMaterial] = useState(false);
  const [manufacturingAddress, setManufacturingAddress] = useState('');
  const navigate = useNavigate();
  const [image, setImage] = useState(null);


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

  const handleImageChange = (event) => {
    if (event.target.files[0]) {
      setImage(event.target.files[0]);
    }
  };

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
          description: description,
          carbonFootprint: carbonFootprint,
          companyAddress: walletAddress,
          weight: weight,
          isRawMaterial: isRawMaterial,
          manufacturingAddress: manufacturingAddress,
        });

        if (image) {
          const storageRef = ref(storage, 'productImage/' + docRef.id + '.png');

          // 'file' comes from the Blob or File API
          const snapShot = await uploadBytes(storageRef, image);
          console.log(snapShot)
          const url = await getDownloadURL(snapShot.ref);
          console.log(url);
          await updateDoc(docRef, {
            productImage: url,
          }).then(() => {
            console.log("Document successfully updated!");
          }
          ).catch((error) => {
            console.error("Error updating document: ", error);
          }
          );
        }

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
    setDescription('');
    setCarbonFootprint('');
    setWeight('');
    setWalletAddress('');
    setManufacturingAddress('');
    setImage(null);
    
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
        <Input type="file" onChange={handleImageChange} />
        <FormControlLabel
          control={
            <Checkbox
              checked={isRawMaterial}
              onChange={(e) => setIsRawMaterial(e.target.checked)}
              color="primary"
            />
          }
          label="Is Raw Material"
        />
        <TextField
          className={classes.input}
          label="Description"
          value={description}
          onChange={e => setDescription(e.target.value)}
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
        <TextField
          className={classes.input}
          label="Manufacturing Address"
          value={manufacturingAddress}
          onChange={e => setManufacturingAddress(e.target.value)}
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
