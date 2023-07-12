import React, { useState, useEffect } from 'react';
import Web3 from 'web3';
import { SHA256 } from 'crypto-js';
import { uploadJson } from "../../upload.mjs"

// @mui material components
import Grid from "@mui/material/Grid";
import FormControl from "@mui/material/FormControl";
import Select from "@mui/material/Select";
import MenuItem from "@mui/material/MenuItem";
import Modal from '@mui/material/Modal';
import Icon from '@mui/material/Icon';


// Material Dashboard 2 React components
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import MDButton from "components/MDButton";
import MDInput from "components/MDInput";
import MDSnackbar from 'components/MDSnackbar';
import MDProgress from 'components/MDProgress';

// Material Dashboard 2 React examples
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import Footer from "examples/Footer";
import MasterCard from "examples/Cards/MasterCard";
import DefaultInfoCard from "examples/Cards/InfoCards/DefaultInfoCard";
import Header from "layouts/issueToken/components/Header";


// Billing page components
import PaymentMethod from "layouts/billing/components/PaymentMethod";
import Invoices from "layouts/billing/components/Invoices";
import BillingInformation from "layouts/billing/components/BillingInformation";
import Transactions from "layouts/issueToken/components/Transactions";

//firebase
import { doc, updateDoc, getDoc, addDoc, collection, arrayUnion, query, where, getDocs, setDoc } from "firebase/firestore";
import { db, storage } from "../../firebase";

import JsPDF from 'jspdf';

//web3
import { CONTRACT_ADDRESS } from "../../constant"
import { Card } from '@mui/material';
const artifacts = require('../../MyToken.json');



const contractAddress = CONTRACT_ADDRESS;

function Billing() {
  const contractABI = artifacts.abi;

  const web3 = new Web3(window.ethereum);
  const contract = new web3.eth.Contract(contractABI, contractAddress);


  const [blockNumber, setBlockNumber] = useState('');
  const [etherscanLink, setEtherscanLink] = useState('');
  const [txHash, setTxHash] = useState('');
  const [product, setProduct] = useState('');
  const [allProducts, setAllProducts] = useState([]);
  const [quantity, setQuantity] = useState('');
  const [cid, setCid] = useState('');
  const [me, setMe] = useState(null);
  const [tokenIssued, setTokenIssued] = useState(false);
  const [open, setOpen] = React.useState(false);
  const [progress, setProgress] = useState(0);
  const [currentState, setCurrentState] = useState("fetching");
  const [mintedProducts, setMintedProducts] = useState([]);
  const [mintedTransactions, setMintedTransactions] = useState([]);
  const [fileType, setFileType] = useState("CSV");
  const [fileName, setFileName] = useState("");
  const [csvData, setCsvData] = useState([["Name", "Token ID", "Block Number", "CID", "Qrcode Link"]]);


  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);
  const states = {
    minting: {
      message: "Minting tokens...",
      image: "",
    },
    success: {
      message: "Tokens minted successfully",
      image: "",
    },
    fetching: {
      message: "Fetching data...",
      image: "",
    },
    uploading: {
      message: "Uploading data...",
      image: "",
    },
    storing: {
      message: "Storing data on IPFS...",
      image: "",
    },
  }

  const colors = {
    success: { color: "success", icon: "check" },
    error: { color: "error", icon: "warning" },
    warning: { color: "warning", icon: "star" },
    info: { color: "info", icon: "notifications" },
  };
  const [message, setMessage] = useState(false);
  const [messageColor, setMessageColor] = useState(colors.success);
  const [title, setTitle] = useState([]);
  const openMessage = () => setMessage(true);
  const closeMessage = () => setMessage(false);
  const renderMessage = (
    <MDSnackbar
      color={messageColor.color}
      icon={messageColor.icon}
      title={title[0] ? title[0] : ""}
      content={title[1] ? title[1] : ""}
      dateTime=""
      open={message}
      onClose={closeMessage}
      close={closeMessage}
      bgWhite
    />
  );



  useEffect(() => {

    fetchMintedProducts();
  }, []);



  const fetchMintedProducts = async () => {
    setMintedProducts([]);
    const xhr = new XMLHttpRequest();
    const walletAddress = (window.ethereum.selectedAddress.toLowerCase());
    xhr.open("GET", "https://deep-index.moralis.io/api/v2/" + walletAddress + "/nft?chain=sepolia&format=decimal&media_items=false");
    xhr.setRequestHeader("accept", "application/json");
    xhr.setRequestHeader("X-API-Key", "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJub25jZSI6ImQ3NWMwZWNkLTA0NWQtNGU0Yy05NmY2LTg0NTljZmZkZjJmNiIsIm9yZ0lkIjoiMzQ2MzI1IiwidXNlcklkIjoiMzU2MDA1IiwidHlwZUlkIjoiYjkxZDk0YTYtMDdmZS00NjgwLTlkOWItZmJlNTEyZjliOGYwIiwidHlwZSI6IlBST0pFQ1QiLCJpYXQiOjE2ODgyODI0NjUsImV4cCI6NDg0NDA0MjQ2NX0.ZeKB90GPvHv947vltLHWtNnAu_ubOoKFIMwpt6fg5k4");
    xhr.onload = function () {
      if (xhr.status === 200) {
        const response = JSON.parse(xhr.responseText);
        console.log(response.result);
        response.result.map(async (p) => {
          if ((p.token_address).toString() == CONTRACT_ADDRESS.toLowerCase()) {
            console.log("Product found");
            const realTokenId = p.token_id;


            const docRef = doc(db, "PsuedoToRealToken", realTokenId);
            const document = await getDoc(docRef);
            if (document.exists()) {
              console.log(document.id, " => ", document.data());
              const psuedoTokenId = document.data().psuedoTokenId;
              const cid = document.data().cid;
              console.log(psuedoTokenId);

              const psuedoTokenIdJson = JSON.parse(psuedoTokenId);
              const docProductRef = doc(db, "products", psuedoTokenIdJson.P);
              const docProductSnap = await getDoc(docProductRef);
              let pDetail = null;
              if (docProductSnap.exists()) {
                console.log("Document data:", docProductSnap.data());
                pDetail = { ...docProductSnap.data(), id: docProductSnap.id };
              }
              const docManufacturerRef = doc(db, "companies", psuedoTokenIdJson.M);
              const docManufacturerSnap = await getDoc(docManufacturerRef);
              let mDetail = null;
              if (docManufacturerSnap.exists()) {
                console.log("Document data:", docManufacturerSnap.data());
                mDetail = { ...docManufacturerSnap.data(), id: docManufacturerSnap.id };
              }
              if (pDetail && mDetail) {
                setMintedProducts((products) => [...products, { ...p, psuedoTokenIdJson: psuedoTokenIdJson, pDetail: pDetail, mDetail: mDetail, cid: cid, id: document.id, hash: document.data().hash }]);
                setCsvData((c) => [...c, [pDetail.productName, p.token_id, p.block_number, cid, "https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=" + cid]])
              }
            }


          }
        })
      } else {
        console.log(xhr.status);
      }
    };
    xhr.send();
  }




  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!fileName || !fileType) {
      openMessage();
      setMessageColor(colors.error);
      setTitle(["Error", "Please fill all the fields"]);
      return;
    }
    if (fileType == "text/csv") {
      console.log(csvData);
      const csv = csvData.reduce((acc, row) => {
        acc += row.join(",") + "\n";
        return acc;
      }, "");
      const link = document.createElement("a");
      link.href = window.URL.createObjectURL(new Blob([csv], { type: fileType }));
      link.download = fileName + ".csv";
      link.click();
    }
    else{
      setMessageColor(colors.info);
      setTitle(["Hi", "Please select csv file for now, we are working on other file types"]);
      openMessage();
    }
  };

  return (
    <DashboardLayout>
      <DashboardNavbar />
      <Header>

        <MDBox mt={5} mb={1}>
          <MDBox
            variant="gradient"
            bgColor="success"
            borderRadius="lg"
            coloredShadow="success"
            mx={2}
            mt={-3}
            p={3}
            mb={1}
            textAlign="center"
          >
            <MDTypography variant="h4" fontWeight="medium" color="white" mt={1}>
              Issue Token
            </MDTypography>
          </MDBox>
          <MDBox pt={4} pb={3} px={3}>
            <MDBox component="form" role="form">

              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <MDBox mb={2} pt={2}>
                    <FormControl fullWidth>
                      <Select
                        displayEmpty
                        inputProps={{ 'aria-label': 'Without label' }}
                        value={fileType}
                        onChange={(e) => setFileType(e.target.value)}
                        sx={{
                          height: '30px',
                        }}
                      >
                        <MenuItem value={'text/csv'} >CSV</MenuItem>
                        <MenuItem value={'pdf'} >PDF</MenuItem>
                        <MenuItem value={'xlsx'} >XLSX</MenuItem>

                      </Select>
                    </FormControl>
                  </MDBox>
                </Grid>
                <Grid item xs={12} md={6}>
                  <MDBox mb={2}>
                    <MDInput
                      label="File Name"
                      type="text"
                      required
                      value={fileName}
                      onChange={(e) => setFileName(e.target.value)}
                      variant="standard"
                      fullWidth />
                  </MDBox>
                </Grid>
              </Grid>
              <MDBox mb={1} >
                <MDButton variant="gradient" color="success" onClick={handleSubmit} sx={{
                  float: 'right',
                }}>
                  Download
                </MDButton>
              </MDBox>
            </MDBox>
          </MDBox>
          {mintedProducts.length > 0 && (
            <MDBox mb={3} mx={3}>
              <MDTypography mb={1} variant="h4" fontWeight="medium">
                All Tokenized Products
              </MDTypography>
              <Grid container spacing={3}>
                {mintedProducts.map((product) =>
                (<Grid key={product.id} item xs={12} lg={6} xl={3}>
                  <DefaultInfoCard
                    icon={product.pDetail.productImage}
                    title={product.pDetail.productName}
                    description={product.mDetail.companyName}
                    value={"Qty: " + product.amount}
                    hash={product.hash}
                    cid={product.cid}
                  />
                </Grid>)
                )}
              </Grid>
            </MDBox>
          )}
        </MDBox>


      </Header>


      {renderMessage}
      <Footer />
    </DashboardLayout>
  );
}

export default Billing;
