import React, { useState, useEffect } from 'react';
import Web3 from 'web3';
import ReactDOM from "react-dom/client";
import { BrowserRouter as Router, Routes, Route, Link, useNavigate } from 'react-router-dom';
import { AppBar, Toolbar, Typography, Button, makeStyles } from '@material-ui/core';
import MintToken from './Pages/MintToken';
import ConnectWallet from './Pages/ConnectWallet';
import AddClient from './Pages/AddClient';
import RegisterCompany from './Pages/RegisterCompany';
import ProductRegistration from './Pages/ProductRegistration';
import AssetTransfer from './Pages/AssetTransfer';

const useStyles = makeStyles((theme) => ({
  navContainer: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  link: {
    textDecoration: 'none',
    color: theme.palette.common.white,
    marginRight: theme.spacing(2),
  },
}));

const Navigation = () => {
  const classes = useStyles();
  const [walletConnected, setWalletConnected] = useState(false);
  const navigate = useNavigate();

  const connectWallet = async () => {
    if (window.ethereum) {
      try {
        await window.ethereum.request({ method: 'eth_requestAccounts' });
        setWalletConnected(true);
      } catch (error) {
        console.error(error);
        setWalletConnected(false);
      }
    } else {
      console.error('Please install Metamask');
    }

  };

  useEffect(() => {
  
    const handleAccountsChanged = () => {
      if (!window.ethereum) {
        setWalletConnected(false);
        navigate("/");
      }
    };
    if (window.ethereum) {
      window.ethereum.on('accountsChanged', handleAccountsChanged);
    }
    else {
      setWalletConnected(false);
      navigate("/");
    }
  });



  return (
    <>
      <AppBar position="static">
        <Toolbar className={classes.navContainer}>
          <Typography variant="h6">Navigation</Typography>


          {walletConnected ? (
            <div>
              <Button
                color="inherit"
                component={Link}
                to="/mint-token"
                className={classes.link}
              >
                Mint Token
              </Button>
              <Button
                color="inherit"
                component={Link}
                to="/add-client"
                className={classes.link}
              >
                Add Client
              </Button>
              <Button
                color="inherit"
                component={Link}
                to="/register-company"
                className={classes.link}
              >
                Register Company
              </Button>
              <Button
                color="inherit"
                component={Link}
                to="/product-registration"
                className={classes.link}
              >
                Product Registration
              </Button>
              <Button
                color="inherit"
                component={Link}
                to="/asset-transfer"
                className={classes.link}
              >
                Asset Transfer
              </Button>
              <Button color="inherit" className={classes.link} disabled="true">
                Connected
              </Button>
            </div>
          ) : (
            <div>
              <Button color="inherit" onClick={connectWallet} className={classes.link}>
                Connect Wallet
              </Button>
            </div>
          )}
        </Toolbar>
      </AppBar>

      <Routes>
        <Route path="/" element={<ConnectWallet isConnected={walletConnected} />} />
        <Route path="/mint-token" element={<MintToken />} />
        <Route path="/add-client" element={<AddClient />} />
        <Route path="/register-company" element={<RegisterCompany />} />
        <Route path="/product-registration" element={<ProductRegistration />} />
        <Route path="/asset-transfer" element={<AssetTransfer />} />
      </Routes>
    </>
  );
};
const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(<Router><Navigation /></Router>);
