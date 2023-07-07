import React, { useState, useEffect } from 'react';
import Web3 from 'web3';
import { TextField, Button, Select, MenuItem, FormControl } from '@material-ui/core';
import {db} from "./firebase";
import { doc, updateDoc, getDoc, arrayUnion } from "firebase/firestore";
import useStyles  from './style';
import { useNavigate } from 'react-router-dom';




const AddClient = ({ isConnected }) => {
    const classes = useStyles();
    const [clientCompanyAddress, setClientCompanyAddress] = useState('');
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
        if(!isConnected) {
            navigate("/");
        }

        fetchAccountAddresses();
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (walletAddress === clientCompanyAddress) {
                throw new Error("Client company wallet address cannot be the same as your company wallet address");
            }
            const me = doc(db, "companies", walletAddress);
            const client = doc(db, "companies", clientCompanyAddress);

            const docSnap = await getDoc(client);
            if (docSnap.exists()) {
                await updateDoc(me, {
                    clients: arrayUnion(clientCompanyAddress)
                }).then(() => {
                    console.log("Document successfully updated!");
                }).catch((error) => {
                    // The document probably doesn't exist.
                    console.error("Error updating document: ", error);
                });
            }
            else {
                throw new Error("Client company wallet address does not exist");
            }

        } catch (e) {
            console.error("Error updating document: ", e);
            alert(e.message);
        }
    };

    return (
        <div className={classes.wrapper}>
            <h1>Add Client</h1>
            <form className={classes.form} onSubmit={handleSubmit}>
                <TextField
                    className={classes.input}
                    label="Client company Wallet Address"
                    value={clientCompanyAddress}
                    onChange={(e) => setClientCompanyAddress(e.target.value)}
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
                <Button
                    className={classes.button}
                    variant="contained"
                    color="primary"
                    type="submit"
                >
                    Submit
                </Button>
            </form>
        </div>

    );
};

export default AddClient;
