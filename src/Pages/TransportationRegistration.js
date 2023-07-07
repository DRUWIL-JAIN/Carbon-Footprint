import React, { useState, useEffect } from 'react';
import { TextField, Button, Select, MenuItem, FormControl } from '@material-ui/core';
import Web3 from 'web3';
import {db} from "./firebase";
import { doc, updateDoc, getDoc, addDoc, collection, arrayUnion } from "firebase/firestore";
import useStyles from './style';
import { useNavigate } from 'react-router-dom';


const TransportationRegistration = ({ isConnected }) => {
    const classes = useStyles();
    const [vehicleName, setVehicleName] = useState('');
    const [vehicleType, setVehicleType] = useState('');
    const [carbonFootprintPKMPKG, setCarbonFootprintPKMPKG] = useState('');
    const [accountAddresses, setAccountAddresses] = useState([]);
    const [walletAddress, setWalletAddress] = useState('');
    const navigate = useNavigate();
    const vehicleTypes = ['Truck', 'Train', 'Ship', 'Airplane'];

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
                
                const docRef = await addDoc(collection(db, "transportation"), {

                    vehicleName: vehicleName,
                    vehicleType: vehicleType,
                    carbonFootprintPKMPKG: carbonFootprintPKMPKG,
                    company: walletAddress,
                });

                await updateDoc(docCompanyRef, {
                    transportation: arrayUnion(docRef.id),
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
        setVehicleName('');
        setVehicleType('');
        setCarbonFootprintPKMPKG('');

    };

    return (
        <div className={classes.wrapper}>
            <h1>Transportation Registration</h1>
            <form onSubmit={handleSubmit} className={classes.form}>
                <TextField
                    className={classes.input}
                    label="Vehicle Name"
                    value={vehicleName}
                    onChange={e => setVehicleName(e.target.value)}
                    required
                />
                <TextField
                    className={classes.input}
                    label="Carbon Footprint in per Kg per Km"
                    value={carbonFootprintPKMPKG}
                    type='number'
                    step='0.01'
                    onChange={e => setCarbonFootprintPKMPKG(e.target.value)}
                    required
                />
                <FormControl className={classes.input}>
                    <Select
                        value={!vehicleTypes.includes(vehicleType) && vehicleType != '' ? 'Other' : vehicleType}
                        onChange={(e) => setVehicleType(e.target.value)}
                        displayEmpty
                        required
                    >
                        <MenuItem value='' disabled>Select vehicle type</MenuItem>
                        {vehicleTypes.map((vehicleType, index) => (
                            <MenuItem value={vehicleType} key={index}>{vehicleType}</MenuItem>
                        ))}
                        <MenuItem value='Other' >Other</MenuItem>
                    </Select>
                </FormControl>
                {!vehicleTypes.includes(vehicleType) && vehicleType != '' && (
                    <TextField
                        className={classes.input}
                        label="Vehicle Name"
                        value={vehicleType === 'Other' ? '' : vehicleType}
                        onChange={e => setVehicleType(e.target.value)}
                        required 
                    />
                )}

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
                    Register Transportation
                </Button>
            </form>
        </div>
    );
};

export default TransportationRegistration;
