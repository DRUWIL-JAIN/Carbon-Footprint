import React, { useState, useEffect } from 'react';
import Web3 from 'web3';
import { TextField, Button, Select, MenuItem, FormControl } from '@material-ui/core';
import { db } from "./firebase";
import { setDoc, doc, getDoc, updateDoc, collection, query, where, getDocs } from "firebase/firestore";
import { CONTRACT_ADDRESS } from "../constant"
import useStyles from './style';
import { useNavigate } from 'react-router-dom';
import { SHA256 } from 'crypto-js';
import { uploadJson } from "./upload.mjs"



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
  const [product, setProduct] = useState(null);
  const [allProducts, setAllProducts] = useState([]);
  const [quantity, setQuantity] = useState('');
  const [cid, setCid] = useState('');
  const [me, setMe] = useState(null);

  const navigate = useNavigate();


  const handleSubmit = async (e) => {
    e.preventDefault();

    try {



      const docProductRef = doc(db, "products", product.id);
      const docProductSnap = await getDoc(docProductRef);

      if (docProductSnap.exists()) {
        const psuedoTokenIdJson = {
          P: docProductSnap.id,
          M: walletAddress
        }
        const psuedoTokenId = JSON.stringify(psuedoTokenIdJson);
        const hash = SHA256(psuedoTokenId).toString();
        console.log("psuedoTokenId", psuedoTokenId);
        const queryRef = query(collection(db, "PsuedoToRealToken"), where("hash", "==", hash));
        const querySnap = await getDocs(queryRef);
        let realTokenId = "";
        if (querySnap.size > 0) {
          querySnap.forEach((doc) => {
            realTokenId = doc.id;
            setCid(doc.data().cid);
          });
          console.log("realTokenId", realTokenId, "psuedoTokenId", psuedoTokenId);
          const receipt = await contract.methods
            .mint(walletAddress, realTokenId, quantity, '0x00')
            .send({ from: window.ethereum.selectedAddress });
          setBlockNumber(receipt.blockNumber);
          setTxHash(receipt.transactionHash);
          setEtherscanLink(`https://sepolia.etherscan.io/tx/${receipt.transactionHash}`);
        }
        else {
          const docDataRef = doc(db, "Data", "Token");
          const docDataSnap = await getDoc(docDataRef);

          if (docDataSnap.exists()) {
            realTokenId = docDataSnap.data().currentTokenId + 1;
            const receipt = await contract.methods
              .mint(walletAddress, realTokenId, quantity, '0x00')
              .send({ from: window.ethereum.selectedAddress });
            setBlockNumber(receipt.blockNumber);
            setTxHash(receipt.transactionHash);
            setEtherscanLink(`https://sepolia.etherscan.io/tx/${receipt.transactionHash}`);



            const nftJson = {
              product: product.id,
              manufacturer: walletAddress,
            };
            nftJson.totalCarbon = parseFloat(product.carbonFootprint);
            nftJson.productDetails = {
              productName: product.productName,
              description: product.description,
              isRawMaterial: product.isRawMaterial,
              weight: product.weight,
              carbonFootPrint: parseFloat(product.carbonFootprint),
              manufacturingAddress: product.manufacturingAddress,
              productImage: product.productImage,
            };
            nftJson.manufacturerDetails = {
              companyName: me.companyName,
              companyAddress: me.companyAddress,
              companyZipCode: me.companyZipCode,
              companyWebsite: me.companyWebsite,
              companyEmail: me.companyEmail,
              companyPhone: me.companyPhone,
              companyScale: me.companyScale,
              companyLogo: me.companyLogo,
            };
            const nftJsonString = JSON.stringify(nftJson);
            console.log("nftJsonString", nftJson);
            const CID = await uploadJson(nftJsonString);
            setCid(CID);


            await updateDoc(docDataRef, {
              currentTokenId: realTokenId
            });
            const docPTRRef = doc(db, "PsuedoToRealToken", String(realTokenId));
            await setDoc(docPTRRef, {
              psuedoTokenId: psuedoTokenId,
              hash: hash,
              cid: CID
            })
          }

        }



      }
      else {
        alert("Company or product not registered");
      }
    } catch (error) {
      console.error('Error creating commit:', error);
    }
  };

  const fetchAllProducts = async () => {
    setAllProducts([]);
    setProduct(null);
    const docRef = doc(db, "companies", walletAddress);
    const docSnap = await getDoc(docRef);
    let isProductAvailable = false;
    if (docSnap.exists()) {
      console.log("Document data:", docSnap.data());
      if (docSnap.data().products) {

        await Promise.all(
        docSnap.data().products.map(async (p) => {
          const docRef = doc(db, "products", p);
          const docSnap = await getDoc(docRef);
          if (docSnap.exists()) {
            if (docSnap.data().isRawMaterial) {
              isProductAvailable = 1;
              console.log("Document data:", docSnap.data());
              isProductAvailable = true;
              setAllProducts((allProducts) => [...allProducts, { ...docSnap.data(), id: p }]);
            }
          }
        }));
        if (!isProductAvailable) {
          alert("No products registered for this company");
        }
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

  const handleMe = async (address) => {
    setWalletAddress(address);
    const docRef = doc(db, "companies", address);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      console.log("Document data:", docSnap.data());
      setMe(docSnap.data());
    } else {
      alert("Company not registered");
    }
  }



  return (
    <div className={classes.wrapper}>
      <h1>Mint Token</h1>
      <form onSubmit={handleSubmit} className={classes.form}>
        <FormControl className={classes.input}>
          <Select
            value={walletAddress}
            onChange={(e) => handleMe(e.target.value)}
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
                value={product ? product : ''}
                onChange={(e) => setProduct(e.target.value)}
                displayEmpty
                required
              >
                <MenuItem value='' disabled>Select Product</MenuItem>
                {allProducts.map((p, index) => (
                  <MenuItem value={p} key={index}>{p.productName} (Description: {p.description}, Carbon footprint: {p.carbonFootprint})</MenuItem>
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
            <span>blockNumber: {blockNumber}</span>
          </div>
          <div>
            <span>txHash: {txHash}</span>
          </div>
          <div>
            <span>CID: {cid ? cid : 'Waiting...'}</span>
          </div>
          <div>
            <span>View NFT Metadata: {"https://" + cid + ".ipfs.nftstorage.link"}</span>
            <Button
              disabled={!cid}
              variant="contained"
              color="primary"
              onClick={() => handleRedirect("https://" + cid + ".ipfs.nftstorage.link")}
            >
              {txHash ? 'Redirect' : 'Waiting...'}
            </Button>
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
