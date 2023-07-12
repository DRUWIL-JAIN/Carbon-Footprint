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
    fetchProducts();
    fetchMintedProducts();
  }, []);

  const handleRedirect = (url) => {
    window.open(url, '_blank');
  };

  const fetchProducts = async () => {
    try {
      setAllProducts([]);
      const walletAddress = (window.ethereum.selectedAddress.toLowerCase());
      const docCompanyRef = doc(db, "companies", walletAddress);
      const docCompanySnap = await getDoc(docCompanyRef);
      if (docCompanySnap.exists()) {
        console.log("Document data:", docCompanySnap.data());
        setMe(docCompanySnap.data());
        if (docCompanySnap.data().products) {
          let isProductAvailable = false;
          await Promise.all(
            docCompanySnap.data().products.map(async (p) => {
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
            throw new Error("You do not have any products");
          }
        }
        else {
          throw new Error("You do not have any products");
        }
      }
      else {
        throw new Error("Company wallet address does not exist");
      }

    }
    catch (error) {
      console.log(error);
      setMessageColor(colors.error);
      setTitle(["Error", error.message]);
      openMessage();
    }
  }

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
              if (docProductSnap.exists() ) {
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
    try {
      handleOpen();
      setProgress(5);
      setCurrentState("fetching");
      if (!product) {
        throw new Error("Please select a product");
      }
      setTokenIssued(false);
      const walletAddress = (window.ethereum.selectedAddress).toLowerCase();
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
          setProgress(30);
          querySnap.forEach((doc) => {
            realTokenId = doc.id;
            setCid(doc.data().cid);
          });
          setProgress(50);
          setCurrentState("minting");
          const receipt = await contract.methods
            .mint(walletAddress, realTokenId, quantity, '0x00')
            .send({ from: window.ethereum.selectedAddress });
          setBlockNumber(receipt.blockNumber);
          setTxHash(receipt.transactionHash);
          setEtherscanLink(`https://sepolia.etherscan.io/tx/${receipt.transactionHash}`);
          setMessageColor(colors.success);
          setTitle(["Success", "Token Issued"]);
          openMessage();
          setTokenIssued(true);
          setProgress(100);
          setCurrentState("success");


          setTimeout(() => {
            fetchMintedProducts();

          }, 3000);

        }
        else {
          setProgress(5);
          setCurrentState("fetching");
          const docDataRef = doc(db, "Data", "Token");
          const docDataSnap = await getDoc(docDataRef);

          if (docDataSnap.exists()) {
            realTokenId = docDataSnap.data().currentTokenId + 1;
            setProgress(10);
            setCurrentState("minting");
            const receipt = await contract.methods
              .mint(walletAddress, realTokenId, quantity, '0x00')
              .send({ from: window.ethereum.selectedAddress });
            setBlockNumber(receipt.blockNumber);
            setTxHash(receipt.transactionHash);
            setEtherscanLink(`https://sepolia.etherscan.io/tx/${receipt.transactionHash}`);
            setProgress(50);
            setCurrentState("storing");
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
            setProgress(80);
            setCurrentState("uploading")
            await updateDoc(docDataRef, {
              currentTokenId: realTokenId
            }).then(() => {
              console.log("Document successfully updated!");
            }).catch((error) => {
              throw new Error("Error updating document");
            });

            setProgress(90)
            const docPTRRef = doc(db, "PsuedoToRealToken", String(realTokenId));
            await setDoc(docPTRRef, {
              psuedoTokenId: psuedoTokenId,
              hash: hash,
              cid: CID
            }).then(() => {
              console.log("Document successfully written!");
            }).catch((error) => {
              throw new Error("Error writing document");
            });
            setProgress(100)
            setCurrentState("success")
            setMessageColor(colors.success);
            setTitle(["Success", "Token Issued"]);
            openMessage();

            setTokenIssued(true);



            //fetch things after 2 seconds
            setTimeout(() => {
              fetchMintedProducts();
            }, 3000);
          }

        }
      }
      else {
        throw new Error("Product does not exist");
      }
    } catch (error) {
      console.log(error);
      setMessageColor(colors.error);
      setTitle(["Error", error.message]);
      openMessage();
      handleClose();
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
                        value={product}
                        onChange={(e) => setProduct(e.target.value)}
                        sx={{
                          height: '30px',
                        }}
                      >
                        <MenuItem value={''} disabled>Select Product</MenuItem>
                        {allProducts.map((p) => (
                          <MenuItem key={p.id} value={p}>{p.productName} (Description: {p.description}, Carbon footprint: {p.carbonFootprint})</MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </MDBox>
                </Grid>
                <Grid item xs={12} md={6}>
                  <MDBox mb={2}>
                    <MDInput
                      label="Quantity"
                      type="number"
                      required
                      value={quantity}
                      onChange={(e) => setQuantity(e.target.value)}
                      variant="standard"
                      fullWidth />
                  </MDBox>
                </Grid>
              </Grid>
              <MDBox mb={1} >
                <MDButton variant="gradient" color="success" onClick={handleSubmit} sx={{
                  float: 'right',
                }}>
                  Issue
                </MDButton>
              </MDBox>
            </MDBox>
          </MDBox>
        </MDBox>


      </Header>

      {mintedProducts.length > 0 && (
        <MDBox mb={3} mx={3}>
          <MDTypography mb={1} variant="h4" fontWeight="medium">
            Tokenized Products (Raw Materials)
          </MDTypography>
          <Grid container spacing={3}>
            {mintedProducts.map((product) => { return product.pDetail.isRawMaterial ?
              (<Grid key={product.id} item xs={12} lg={6} xl={3}>
                <DefaultInfoCard
                  icon={product.pDetail.productImage}
                  title={product.pDetail.productName}
                  description={product.mDetail.companyName}
                  value={"Qty: " + product.amount}
                  hash={product.hash}
                  cid={product.cid}
                />
              </Grid>) : (<></>)
            })}
          </Grid>
        </MDBox>
      )}
      {renderMessage}
      <Modal
        open={open}
        onClose={handleClose}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
      >
        <Card sx={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          minWidth: 400,
          bgcolor: 'background.paper',
          boxShadow: 24,
          p: 4,
        }}>

          <MDBox mb={2} pt={2}>
            {progress < 100 && (
              <>
                <MDBox mb={2} sx={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  height: '100%',
                }}>
                  <MDBox component="img" src={me? me.companyLogo:""} alt="logo" sx={{
                    width: '100px',
                    height: '100px',
                    borderRadius: '50%',
                    border: '1px solid #e0e0e0',
                  }} />
                  <MDBox sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    height: '100%',
                  }}>
                    <Icon fontSize="medium">arrow_forward</Icon>
                  </MDBox>
                  <MDBox component="img" src={me? me.companyLogo:""} alt="logo" sx={{
                    width: '100px',
                    height: '100px',
                    borderRadius: '50%',
                    border: '1px solid #e0e0e0',
                  }} />
                </MDBox>
                <MDBox>
                  <MDTypography variant="h6" fontWeight="medium" mt={1}>
                    {states[currentState].message}
                  </MDTypography>
                  <MDProgress variant="gradient" color={"success"} value={progress} />
                </MDBox>
              </>
            )}
            {tokenIssued && (
              <>
                <MDBox mb={2} sx={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}>
                  <MDBox sx={{
                    alignItems: 'center',
                    width: "600px",
                  }}>
                    <MasterCard number={txHash} holder={blockNumber} expires={cid} />
                  </MDBox>
                </MDBox>
                <Grid container spacing={3}>
                  <Grid item xs={12} md={6}>
                    <MDButton variant="gradient" color="success" fullWidth onClick={() => handleRedirect(etherscanLink)}>
                      See Transactions Details
                    </MDButton>
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <MDButton variant="gradient" color="success" fullWidth onClick={() => handleRedirect("https://" + cid + ".ipfs.nftstorage.link")}>
                      See Token Details
                    </MDButton>
                  </Grid>
                </Grid>
              </>
            )}
          </MDBox>
        </Card>
      </Modal>
      <Footer />
    </DashboardLayout>
  );
}

export default Billing;
