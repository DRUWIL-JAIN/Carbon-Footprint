import React from 'react';
import { Typography, makeStyles } from '@material-ui/core';

const useStyles = makeStyles((theme) => ({
  root: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    height: '40vh',
  },
}));

const ConnectWallet = ({ isConnected }) => {
  const classes = useStyles();

  return (
    <div className={classes.root}>
      <Typography variant="h4">
        {isConnected ? 'Wallet connected!' : 'Connect your wallet'}
      </Typography>
    </div>
  );
};

export default ConnectWallet;
