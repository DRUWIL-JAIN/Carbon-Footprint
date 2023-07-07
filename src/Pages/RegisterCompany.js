import React, { useState, useEffect } from 'react';
import Web3 from 'web3';
import useStyles from './style';
import { TextField, Button, Select, MenuItem, FormControl, Input } from '@material-ui/core';
import { db, storage } from "./firebase";
import { doc, setDoc, getDoc } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { useNavigate } from 'react-router-dom';



const RegisterCompany = ({ isConnected }) => {
    const classes = useStyles();
    const [companyName, setCompanyName] = useState('');
    const [companyAddress, setCompanyAddress] = useState('');
    const [companyScale, setCompanyScale] = useState('');
    const [walletAddress, setWalletAddress] = useState('');
    const [accountAddresses, setAccountAddresses] = useState([]);
    const [companyType, setCompanyType] = useState('');
    const [companyZipCode, setCompanyZipCode] = useState('');
    const [companyWebsite, setCompanyWebsite] = useState('');
    const [companyEmail, setCompanyEmail] = useState('');
    const [companyPhone, setCompanyPhone] = useState('');
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
            if (docCompanySnap.exists()) {
                alert("Company already registered");
                return;
            }
            if (image) {
                try {
                    const storageRef = ref(storage, 'companyLogo/' + walletAddress + '.png');

                    // 'file' comes from the Blob or File API
                    const snapShot = await uploadBytes(storageRef, image);
                    console.log(snapShot)
                    const url = await getDownloadURL(snapShot.ref);
                    console.log(url);
                    await setDoc(docCompanyRef, {
                        companyScale: companyScale,
                        companyName: companyName,
                        companyAddress: companyAddress,
                        companyType: companyType,
                        companyZipCode: companyZipCode,
                        companyWebsite: companyWebsite,
                        companyEmail: companyEmail,
                        companyPhone: companyPhone,
                        companyLogo: url,
                    }).then(() => {
                        console.log("Document successfully written!");
                    }).catch((error) => {
                        console.error("Error writing document: ", error);
                    });
                } catch (error) {
                    console.log(error);
                }
            }





        } catch (e) {
            console.error("Error adding document: ", e);
        }
    };

    return (
        <div className={classes.wrapper}>
            <h1>Register Company</h1>
            <form className={classes.form} onSubmit={handleSubmit}>
                <TextField
                    className={classes.input}
                    label="Company Name"
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    required
                />
                <Input type="file" onChange={handleImageChange} required />
                <TextField
                    className={classes.input}
                    label="Company Address"
                    value={companyAddress}
                    onChange={(e) => setCompanyAddress(e.target.value)}
                    required
                />
                <TextField
                    className={classes.input}
                    label="Company Zip Code"
                    value={companyZipCode}
                    onChange={(e) => setCompanyZipCode(e.target.value)}
                    required
                />
                <TextField
                    className={classes.input}
                    label="Company Website"
                    value={companyWebsite}
                    onChange={(e) => setCompanyWebsite(e.target.value)}
                    required
                />
                <TextField
                    className={classes.input}
                    label="Company Email"
                    value={companyEmail}
                    onChange={(e) => setCompanyEmail(e.target.value)}
                    required
                />
                <TextField
                    className={classes.input}
                    label="Company Phone"
                    value={companyPhone}
                    onChange={(e) => setCompanyPhone(e.target.value)}
                    required
                />
                <FormControl className={classes.input}>
                    <Select
                        value={companyScale}
                        onChange={(e) => setCompanyScale(e.target.value)}
                        displayEmpty
                        required
                    >
                        <MenuItem value='' disabled>Select Company Size</MenuItem>
                        <MenuItem value="small">Small (1-100)</MenuItem>
                        <MenuItem value="medium">Medium (100-1000)</MenuItem>
                        <MenuItem value="large">Large (1000+)</MenuItem>
                    </Select>
                </FormControl>
                <FormControl className={classes.input}>
                    <Select
                        value={companyType}
                        onChange={(e) => setCompanyType(e.target.value)}
                        displayEmpty
                        required
                    >
                        <MenuItem value='' disabled>Select Company type</MenuItem>
                        <MenuItem value="Manufacturer">Manufacturer</MenuItem>
                        <MenuItem value="Logistics">Logistics</MenuItem>
                        <MenuItem value="Retailer">Retailer</MenuItem>
                    </Select>
                </FormControl>
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

export default RegisterCompany;
