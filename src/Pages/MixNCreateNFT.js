import React, { useState, useEffect } from 'react';
import Web3 from 'web3';
import { TextField, Button, Select, MenuItem, FormControl } from '@material-ui/core';
import db from "./firebase";
import { doc, getDoc, getDocs, query, collection, where, updateDoc, setDoc } from "firebase/firestore";
import { CONTRACT_ADDRESS } from "../constant"
import useStyles from './style';
import { useNavigate } from 'react-router-dom';
import { SHA256 } from 'crypto-js';





const artifacts = require('../MyToken.json');
const contractABI = artifacts.abi;
const contractAddress = CONTRACT_ADDRESS;

const web3 = new Web3(window.ethereum);
const contract = new web3.eth.Contract(contractABI, contractAddress);




const MixNCreate = ({ isConnected }) => {
    const classes = useStyles();
    const [blockNumber, setBlockNumber] = useState('');
    const [etherscanLink, setEtherscanLink] = useState('');
    const [txHash, setTxHash] = useState('');
    const [accountAddresses, setAccountAddresses] = useState([]);
    const [walletAddress, setWalletAddress] = useState('');


    const [quantity, setQuantity] = useState('');
    const navigate = useNavigate();
    const [products, setProducts] = useState([]);
    const [product, setProduct] = useState(null);
    const [burnNFTs, setBurnNFTs] = useState([]);
    const [mintQuantity, setMintQuantity] = useState('');
    const [newMyProduct, setNewMyProduct] = useState('');
    const [allMyProducts, setAllMyProducts] = useState([]);



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

    const fetchProduct = async () => {
        setBurnNFTs([]);
        setProducts([]);
        setProduct(null);
        setNewMyProduct('');
        setAllMyProducts([]);
        setMintQuantity('');

        const xhr = new XMLHttpRequest();
        xhr.open("GET", "https://deep-index.moralis.io/api/v2/" + walletAddress + "/nft?chain=sepolia&format=decimal&media_items=false");
        xhr.setRequestHeader("accept", "application/json");
        xhr.setRequestHeader("X-API-Key", "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJub25jZSI6ImQ3NWMwZWNkLTA0NWQtNGU0Yy05NmY2LTg0NTljZmZkZjJmNiIsIm9yZ0lkIjoiMzQ2MzI1IiwidXNlcklkIjoiMzU2MDA1IiwidHlwZUlkIjoiYjkxZDk0YTYtMDdmZS00NjgwLTlkOWItZmJlNTEyZjliOGYwIiwidHlwZSI6IlBST0pFQ1QiLCJpYXQiOjE2ODgyODI0NjUsImV4cCI6NDg0NDA0MjQ2NX0.ZeKB90GPvHv947vltLHWtNnAu_ubOoKFIMwpt6fg5k4");
        xhr.onload = function () {
            if (xhr.status === 200) {
                const response = JSON.parse(xhr.responseText);
                console.log(response.result);
                var productFound = false;
                response.result.map(async (p) => {
                    if ((p.token_address).toString() == CONTRACT_ADDRESS.toLowerCase()) {
                        console.log("Product found");
                        productFound = true;
                        const realTokenId = p.token_id;


                        const docRef = doc(db, "PsuedoToRealToken", realTokenId);
                        const document = await getDoc(docRef);
                        if (document.exists()) {
                            console.log(document.id, " => ", document.data());
                            const psuedoTokenId = document.data().psuedoTokenId;
                            console.log(psuedoTokenId);

                            const psuedoTokenIdJson = JSON.parse(psuedoTokenId);
                            const docProductRef = doc(db, "products", psuedoTokenIdJson.P);
                            const docProductSnap = await getDoc(docProductRef);
                            let pDetail = null;
                            if (docProductSnap.exists()) {
                                console.log("Document data:", docProductSnap.data());
                                pDetail = docProductSnap.data();
                            }
                            const docManufacturerRef = doc(db, "companies", psuedoTokenIdJson.M);
                            const docManufacturerSnap = await getDoc(docManufacturerRef);
                            let mDetail = null;
                            if (docManufacturerSnap.exists()) {
                                console.log("Document data:", docManufacturerSnap.data());
                                mDetail = docManufacturerSnap.data();
                            }
                            if (pDetail && mDetail) {
                                const trace = pDetail.productName + " (Manufacturer: " + mDetail.companyName + ")";
                                setProducts((products) => [...products, { ...p, trace: trace, psuedoTokenIdJson: psuedoTokenIdJson, pDetail: pDetail, mDetail: mDetail }]);
                            }
                        }

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
        if (burnNFTs.length < 2) {
            alert("Select atleast two NFT to Mix");
            return;
        }
        else {

            let psuedoTokenIdJson = {};
            psuedoTokenIdJson.P = newMyProduct;
            psuedoTokenIdJson.M = walletAddress;

            const burnNFTIds = [];
            const burnNFTAmounts = [];

            for(const b of burnNFTs){
                burnNFTIds.push(b.token_id);
                burnNFTAmounts.push(b.quantity);
                if(psuedoTokenIdJson.S)
                {
                    psuedoTokenIdJson.S.push(b.token_id);
                }
                else{
                    psuedoTokenIdJson.S = [b.token_id];
                }
            }

            const newPsuedoTokenId = JSON.stringify(psuedoTokenIdJson);
            const hash = SHA256(newPsuedoTokenId).toString();

            console.log(newPsuedoTokenId);

            try {

                const queryRef = query(collection(db, "PsuedoToRealToken"), where("hash", "==", hash));
                const querySnapshot = await getDocs(queryRef);
                let realTokenId = 0;

                if (querySnapshot.size > 0) {

                    for (const doc of querySnapshot.docs) {
                        console.log(doc.id, " => ", doc.data());
                        realTokenId = doc.id;
                        console.log(realTokenId);
                    }
                }
                else {
                    console.log("No such document!");
                    const docRef = doc(db, "Data", "Token");
                    const docSnap = await getDoc(docRef);
                    if (docSnap.exists()) {
                        console.log("Document data:", docSnap.data());
                        realTokenId = docSnap.data().currentTokenId + 1;
                        await updateDoc(docRef, {
                            currentTokenId: realTokenId
                        });
                        await setDoc(doc(db, "PsuedoToRealToken", String(realTokenId)), {
                            psuedoTokenId: newPsuedoTokenId,
                            hash: hash
                        });
                        
                    }
                }
                console.log(walletAddress, walletAddress, burnNFTIds, String(realTokenId), burnNFTAmounts, mintQuantity);
                const receipt = await contract.methods
                    .burnNmintBatch(walletAddress, walletAddress, burnNFTIds, String(realTokenId), burnNFTAmounts, mintQuantity)
                    .send({ from: window.ethereum.selectedAddress });
                setBlockNumber(receipt.blockNumber);
                setTxHash(receipt.transactionHash);
                setEtherscanLink(`https://sepolia.etherscan.io/tx/${receipt.transactionHash}`);

            } catch (error) {
                console.error('Error creating commit:', error);
            }
        }
    };

    const handleRedirect = (url) => {
        window.open(url, '_blank');
    };



    const handleAddToPreset = async (e) => {
        if (quantity == '' || quantity == 0 || quantity > parseInt(product.amount)) {
            alert("Please enter valid quantity");
            return;
        }
        setBurnNFTs((burnNFTs) => [...burnNFTs, { ...product, quantity: quantity }]);
        const tempProducts = products;
        for (let i = 0; i < tempProducts.length; i++) {
            if (tempProducts[i].token_id == product.token_id) {
                tempProducts.splice(i, 1)
            }
        }


        setProducts(tempProducts);
        setQuantity('');
        setProduct(null);
    }

    const fetchAllMyProducts = async () => {
        setAllMyProducts([]);
        setProduct(null);
        setQuantity('');
        setNewMyProduct('');
        setMintQuantity('');
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
                        setAllMyProducts((allMyProducts) => [...allMyProducts, { ...docSnap.data(), id: p }]);
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

    return (
        <div className={classes.wrapper}>
            <h1>Mix & Create</h1>
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
                    <>
                        <Button
                            className={classes.button}
                            variant="contained"
                            color="primary"
                            onClick={fetchProduct}
                        >
                            Fetch Products
                        </Button>

                        {burnNFTs.length > 0 && (
                            <>
                                <ul>
                                    {burnNFTs.map((item, index) => (
                                        <li key={index}>
                                            <span>{item.pDetail.productName} (Qty: {item.quantity}, Manufacturer: {item.mDetail.companyName})</span>
                                        </li>
                                    ))}
                                </ul>
                            </>
                        )}


                        {products.length > 0 && (
                            <>
                                <FormControl className={classes.input}>
                                    <Select
                                        value={product ? product : ''}
                                        onChange={(e) => setProduct(e.target.value)}
                                        displayEmpty
                                    >
                                        <MenuItem value='' disabled>Select Product</MenuItem>
                                        {products.map((p, index) => (
                                            <MenuItem value={p} key={index}>{p.trace}</MenuItem>
                                        ))}
                                    </Select>
                                </FormControl>

                                <TextField
                                    label="NFT Token Id"
                                    value={product ? product.token_id : ''}
                                    fullWidth
                                    className={classes.input}
                                    disabled
                                />
                                {product && (
                                    <>
                                        <TextField
                                            label={"Product Amount (available: " + product.amount + ")"}
                                            value={quantity}
                                            onChange={(e) => setQuantity(e.target.value)}
                                            fullWidth
                                            className={classes.input}
                                            required
                                            type="number"
                                            InputProps={{
                                                inputProps: {
                                                    max: product.amount, min: 1
                                                }
                                            }}
                                        />
                                        {quantity && (
                                            <Button
                                                className={classes.button}
                                                variant="contained"
                                                color="primary"
                                                onClick={handleAddToPreset}
                                            >
                                                Add to preset
                                            </Button>
                                        )}
                                    </>
                                )}

                            </>

                        )}
                        {burnNFTs.length > 1 && (
                            <>
                                <Button
                                    className={classes.button}
                                    variant="contained"
                                    color="primary"
                                    onClick={fetchAllMyProducts}
                                >
                                    Fetch My Products
                                </Button>
                                {allMyProducts.length > 0 && (
                                    <>
                                        <h3>Mint new product</h3>
                                        <FormControl className={classes.input}>
                                            <Select
                                                value={newMyProduct}
                                                onChange={(e) => setNewMyProduct(e.target.value)}
                                                displayEmpty
                                                required
                                            >
                                                <MenuItem value='' disabled>Select Product</MenuItem>
                                                {allMyProducts.map((p, index) => (
                                                    <MenuItem value={p.id} key={index}>{p.productName} (Qty: {p.baseQuantity}, Carbon footprint: {p.carbonFootprint})</MenuItem>
                                                ))}
                                            </Select>
                                        </FormControl>
                                        <TextField
                                            label="New NFT Amount"
                                            value={mintQuantity}
                                            onChange={(e) => setMintQuantity(e.target.value)}
                                            fullWidth
                                            className={classes.input}
                                            required
                                            type="number"
                                            InputProps={{
                                                inputProps: {
                                                    min: 0
                                                }
                                            }}
                                        />
                                    </>
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

export default MixNCreate;
