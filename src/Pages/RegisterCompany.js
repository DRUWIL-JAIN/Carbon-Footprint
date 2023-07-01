import React, { useState, useEffect } from 'react';
import Web3 from 'web3';
import { makeStyles } from '@material-ui/core/styles';
import TextField from '@material-ui/core/TextField';
import FormControl from '@material-ui/core/FormControl';
import Select from '@material-ui/core/Select';
import MenuItem from '@material-ui/core/MenuItem';
import Button from '@material-ui/core/Button';
import db from "./firebase";
import { doc, setDoc } from "firebase/firestore";


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
        textAlign: 'left',
    },
    button: {
        marginTop: theme.spacing(2),
    },
}));

const RegisterCompany = () => {
    const classes = useStyles();
    const [companyName, setCompanyName] = useState('');
    const [companyAddress, setCompanyAddress] = useState('');
    const [companyScale, setCompanyScale] = useState('');
    const [walletAddress, setWalletAddress] = useState('');
    const [accountAddresses, setAccountAddresses] = useState([]);

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
            // Add a new document in collection "cities"
            await setDoc(doc(db, "companies", walletAddress), {
                companyScale: companyScale,
                companyName: companyName,
                companyAddress: companyAddress
            }).then(() => {
                console.log("Document successfully written!");
            }).catch((error) => {
                console.error("Error writing document: ", error);
            });

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
                <TextField
                    className={classes.input}
                    label="Company Address"
                    value={companyAddress}
                    onChange={(e) => setCompanyAddress(e.target.value)}
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
