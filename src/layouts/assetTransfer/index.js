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
  const [me, setMe] = useState('');
  const [tokenIssued, setTokenIssued] = useState(false);
  const [open, setOpen] = React.useState(false);
  const [progress, setProgress] = useState(0);
  const [currentState, setCurrentState] = useState("fetching");
  const [mintedProducts, setMintedProducts] = useState([]);
  const [clients, setClients] = useState([]);
  const [client, setClient] = useState('');
  const [products, setProducts] = useState([]);
  const [transportation, setTransportation] = useState([]);
  const [transportInvolved, setTransportInvolved] = useState([]);
  const [transportInstance, setTransportInstance] = useState('');
  const [distanceInstance, setDistanceInstance] = useState('');


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
    transfering: {
      message: "Transfering tokens...",
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
    fetchAllClients();
  }, []);

  const handleRedirect = (url) => {
    window.open(url, '_blank');
  };


  const fetchAllClients = async () => {
    setClients([]);
    setClient('');
    setTransportation([]);
    setTransportInvolved([]);
    setDistanceInstance('');
    setTransportInstance('');

    const walletAddress = (window.ethereum.selectedAddress).toLowerCase();
    const docRef = doc(db, "companies", walletAddress);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {

      setMe(docSnap.data());
      if (docSnap.data().companyType === "Logistics") {
        if (!docSnap.data().transportation) {
          setMessageColor(colors.error);
          setTitle(["Error", "No transportation registered"]);
          openMessage();
          return;
        }
        docSnap.data().transportation.map(async (p) => {
          const docRef = doc(db, "transportation", p);
          const docSnap = await getDoc(docRef);
          if (docSnap.exists()) {
            console.log("Document data:", docSnap.data());
            setTransportation((transportation) => [...transportation, { ...docSnap.data(), id: p }]);
          }
        })
      }


      console.log("Document data:", docSnap.data());
      if (!docSnap.data().clients) {
        setMessageColor(colors.error);
        setTitle(["Error", "No clients registered"]);
        openMessage();
        return;
      }
      if (docSnap.data().clients.length > 0) {
        console.log("Document data:", docSnap.data());
        docSnap.data().clients.map(async (p) => {
          const docRef = doc(db, "companies", p);
          const docSnap = await getDoc(docRef);
          if (docSnap.exists()) {
            console.log("Document data:", docSnap.data());
            setClients((clients) => [...clients, { ...docSnap.data(), id: p }]);
          }
        })
      }

    } else {
      // doc.data() will be undefined in this case
      console.log("No such document!");
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
    if (!client || !product) {
      setMessageColor(colors.error);
      setTitle(["Error", "Please select a client and product"]);
      openMessage();
      return;
    }
    if (quantity <= 0 || quantity > product.amount) {
      setMessageColor(colors.error);
      setTitle(["Error", "Please enter a valid quantity"]);
      openMessage();
      return;
    }
    handleOpen();
    setProgress(5);
    setCurrentState("fetching");
    setTokenIssued(false);
    const walletAddress = (window.ethereum.selectedAddress).toLowerCase();

    if (me.companyType == 'Logistics' && transportInvolved.length == 0) {
      setMessageColor(colors.error);
      setTitle(["Error", "Please add atleast one transportion"]);
      openMessage();
      return;
    }

    try {
      console.log("Product", product.psuedoTokenIdJson);
      let psuedoTokenIdJson = product.psuedoTokenIdJson;

      if (client.companyType == "Logistics") {
        if (!psuedoTokenIdJson.L) {
          psuedoTokenIdJson.L = [client.id];
        }
        else {
          psuedoTokenIdJson.L.push(client.id);
        }
      }
      else if (client.companyType == "Retailer") {
        if (!psuedoTokenIdJson.R) {
          psuedoTokenIdJson.R = [client.id];
        }
        else {
          psuedoTokenIdJson.R.push(client.id);
        }
      }
      else if (client.companyType == "Manufacturer") {
        if (!psuedoTokenIdJson.S) {
          psuedoTokenIdJson.St = [client.id];
        }
        else {
          psuedoTokenIdJson.St.push(client.id);
        }
      }

      if (transportInvolved.length > 0) {
        transportInvolved.map((t) => {
          if (!psuedoTokenIdJson.T) {
            psuedoTokenIdJson.T = [t.Transport.id];
            psuedoTokenIdJson.D = [t.Distance]
          }
          else {
            psuedoTokenIdJson.T.push(t.Transport.id);
            psuedoTokenIdJson.D.push(t.Distance);
          }
        })
      }

      console.log("Product", psuedoTokenIdJson);

      const psuedoTokenId = JSON.stringify(psuedoTokenIdJson);

      const hash = SHA256(psuedoTokenId).toString();
      const queryRef = query(collection(db, "PsuedoToRealToken"), where("hash", "==", hash));
      const querySnap = await getDocs(queryRef);
      let realTokenId = 0;
      if (querySnap.size > 0) {
        setProgress(30);
        querySnap.forEach((doc) => {
          console.log(doc.id, " => ", doc.data());
          realTokenId = doc.id;
          setCid(doc.data().cid);
        });
        setProgress(50);
        setCurrentState("transfering");
        const receipt = await contract.methods
          .burnNmint(walletAddress, client.id, product.token_id, String(realTokenId), quantity)
          .send({ from: window.ethereum.selectedAddress });
        setBlockNumber(receipt.blockNumber);
        setTxHash(receipt.transactionHash);
        setEtherscanLink(`https://sepolia.etherscan.io/tx/${receipt.transactionHash}`);
        console.log(receipt);

        setMessageColor(colors.success);
        setTitle(["Success", "Product transfered successfully"]);
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
        console.log("No such document!");
        const docRef = doc(db, "Data", "Token");
        const docSnap = await getDoc(docRef);

        const url = "https://ipfs.io/ipfs/" + product.cid;
        var xhr = new XMLHttpRequest();
        xhr.open('GET', url, true);
        xhr.responseType = 'json';
        xhr.onload = async function () {
          var status = xhr.status;
          if (status === 200) {
            // console.log(xhr.response);
            const data = xhr.response;
            let nftJson = data;

            if (me.companyType == "Logistics") {
              const foundLogistics = nftJson.logistics.findIndex(logistic => logistic.companyId === walletAddress);
              if (foundLogistics != -1) {
                console.log("Found logistics object:", foundLogistics);
                nftJson.logistics[foundLogistics].transportInvolved = transportInvolved;
                console.log("Updated logistics object:", nftJson);
                let totalCarbon = nftJson.totalCarbon;
                for (const t in transportInvolved) {
                  // console.log(transportInvolved[t].Distance, product.pDetail.weight, transportInvolved[t].Transport.carbonFootprintPKMPKG);
                  totalCarbon += parseFloat(transportInvolved[t].Distance) * parseFloat(product.pDetail.weight) * parseFloat(transportInvolved[t].Transport.carbonFootprintPKMPKG);
                }
                nftJson.totalCarbon = totalCarbon;
              } else {
                setMessageColor(colors.error);
                setTitle(["Error", "You are not authorized to transfer this product"]);
                return;
              }
            }
            const clientData = {
              companyId: client.id,
              companyName: client.companyName,
              companyAddress: client.companyAddress,
              companyZipCode: client.companyZipCode,
              companyWebsite: client.companyWebsite,
              companyEmail: client.companyEmail,
              companyPhone: client.companyPhone,
              companyScale: client.companyScale,
              companyLogo: client.companyLogo,
            }
            if (client.companyType == "Logistics") {

              if (!nftJson.logistics) {
                nftJson.logistics = [clientData];
              }
              else {
                nftJson.logistics.push(clientData);
              }
            }
            else if (client.companyType == "Retailer") {

              nftJson.retailer = clientData;
            } else if (client.companyType == "Manufacturer") {
              nftJson.currentlyAt = clientData;
            }
            console.log("Product", nftJson);

            if (docSnap.exists()) {
              console.log("Document data:", docSnap.data());
              realTokenId = docSnap.data().currentTokenId + 1;

              setProgress(20);
              setCurrentState("transfering");

              const receipt = await contract.methods
                .burnNmint(walletAddress, client.id, product.token_id, String(realTokenId), quantity)
                .send({ from: window.ethereum.selectedAddress });
              setBlockNumber(receipt.blockNumber);
              setTxHash(receipt.transactionHash);
              setEtherscanLink(`https://sepolia.etherscan.io/tx/${receipt.transactionHash}`);
              console.log(receipt);

              setProgress(50);
              setCurrentState("storing");
              const nftJsonString = JSON.stringify(nftJson);
              console.log("nftJsonString", nftJson);
              const CID = await uploadJson(nftJsonString);
              setCid(CID);

              setProgress(80);
              setCurrentState("uploading")
              await updateDoc(docRef, {
                currentTokenId: realTokenId
              });
              await setDoc(doc(db, "PsuedoToRealToken", String(realTokenId)), {
                psuedoTokenId: psuedoTokenId,
                hash: hash,
                cid: CID
              });
              setMessageColor(colors.success);
              setTitle(["Success", "Product transfered successfully"]);
              openMessage();
              setTokenIssued(true);
              setProgress(100)
              setCurrentState("success")

            }
            //set timeout 2 seconds
            setTimeout(() => {
              fetchMintedProducts();
            }, 3000);
          }
          else {
            setMessageColor(colors.error);
            setTitle(["Error", "Error fetching product data"]);
            openMessage();
            return;
          }
        };
        xhr.send();


      }
      console.log(walletAddress, client.id, product.token_id, realTokenId, quantity);

    } catch (error) {
      console.error('Error creating commit:', error);
    }
  };

  const addTransport = async (e) => {
    e.preventDefault();
    console.log(transportInstance, distanceInstance);
    if (!transportInstance || distanceInstance == '') {
      setMessageColor(colors.error);
      setTitle(["Error", "Please fill all the fields"]);
      openMessage();
      return;
    }
    if (parseFloat(distanceInstance) <= 0) {
      setMessageColor(colors.error);
      setTitle(["Error", "Distance should be greater than 0"]);
      openMessage();
      return;
    }
    setTransportInvolved((transportInvolved) => [...transportInvolved, { Transport: transportInstance, Distance: distanceInstance }]);
    setTransportInstance('');
    setDistanceInstance('');
  }

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
              Asset Transfer
            </MDTypography>
          </MDBox>
          <MDBox pt={4} pb={3} px={3}>
            <MDBox component="form" role="form">

              <Grid container spacing={2}>
                <Grid item xs={12} sm={4}>
                  <MDBox mb={2} pt={2}>
                    <FormControl fullWidth>
                      <Select
                        displayEmpty
                        inputProps={{ 'aria-label': 'Without label' }}
                        value={client}
                        onChange={(e) => setClient(e.target.value)}
                        sx={{
                          height: '30px',
                        }}
                      >
                        <MenuItem value={''} disabled>Select Client</MenuItem>
                        {clients.map((p) => (
                          <MenuItem key={p} value={p}>{p.companyName}</MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </MDBox>
                </Grid>
                <Grid item xs={12} sm={4}>

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
                        {mintedProducts.map((p) => (
                          <MenuItem key={p.pDetail.id} value={p}>{p.pDetail.productName} (Description: {p.pDetail.description}, Hash: {p.hash.slice(0,15)+"..."})</MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </MDBox>
                </Grid>

                <Grid item xs={12} sm={4}>

                  <MDBox mb={2}>
                    <MDInput
                      label={product ? "Quantity (Max: " + product.amount + ")" : "Quantity"}
                      type="number"
                      required
                      value={quantity}
                      onChange={(e) => setQuantity(parseFloat(e.target.value))}
                      InputProps={{
                        inputProps: {
                          max: product.amount, min: 1
                        }
                      }}
                      variant="standard"
                      fullWidth />
                  </MDBox>
                </Grid>
              </Grid>

              {me.companyType == "Logistics" && (
                <>
                  <Grid container spacing={2}>
                    <Grid item xs={12} sm={6} mt={2} pb={1}>
                      <MDBox sx={{
                        borderRadius: '10px',
                        borderWidth: '1px',
                        borderStyle: 'solid',
                        borderColor: '#e0e0e0',
                        height: '100%',
                        padding: '10px',
                      }}>

                        {transportInvolved.map((item, index) => (
                          <>
                            <MDTypography variant="h6" fontWeight="regular">
                              {item.Transport.vehicleName} (Distance: {item.Distance} km)
                            </MDTypography>
                          </>
                        ))}
                      </MDBox>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <MDBox mt={2} mb={1}>
                        <FormControl fullWidth>
                          <Select
                            displayEmpty
                            inputProps={{ 'aria-label': 'Without label' }}
                            value={transportInstance}
                            onChange={(e) => setTransportInstance(e.target.value)}
                            sx={{
                              height: '30px',
                            }}
                          >
                            <MenuItem value={''} disabled>Select transportation</MenuItem>
                            {transportation.map((p) => (
                              <MenuItem value={p} key={p.id}>{p.vehicleName}</MenuItem>
                            ))}
                          </Select>
                        </FormControl>
                      </MDBox>

                      <MDBox mb={2}>
                        <MDInput
                          label={"Distance covered (in km)"}
                          type="number"
                          required
                          value={distanceInstance}
                          onChange={(e) => setDistanceInstance(parseFloat(e.target.value))}
                          InputProps={{
                            inputProps: {
                              min: 0
                            }
                          }}
                          variant="standard"
                          fullWidth />
                      </MDBox>


                      <MDButton variant="outlined" color="success" onClick={addTransport} sx={{
                        float: 'right',
                      }}>
                        Add Transport
                      </MDButton>
                    </Grid>
                  </Grid>
                </>

              )}


              <MDBox mt={2} mb={1} >
                <MDButton variant="gradient" color="success" onClick={handleSubmit} sx={{
                  float: 'right',
                }}>
                  Transfer
                </MDButton>
              </MDBox>
            </MDBox>
          </MDBox>
        </MDBox>


      </Header>

      {mintedProducts.length > 0 && (
        <MDBox mb={3} mx={3}>
          <MDTypography mb={1} variant="h4" fontWeight="medium" color="textPrimary">
            Inventory
          </MDTypography>
          <Grid container spacing={3}>
            {mintedProducts.map((product) => (
              <Grid item xs={12} lg={6} xl={3}>
                <DefaultInfoCard
                  icon={product.pDetail.productImage}
                  title={product.pDetail.productName}
                  description={product.mDetail.companyName}
                  hash={product.hash}
                  value={"amt: " + product.amount}
                  cid={product.cid}
                />
              </Grid>
            ))}
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
                <MDBox component="img" src={me.companyLogo} alt="logo" sx={{
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
                <MDBox component="img" src={client.companyLogo} alt="logo" sx={{
                  width: '100px',
                  height: '100px',
                  borderRadius: '50%',
                  border: '1px solid #e0e0e0',
                }} />
              </MDBox>
              <MDBox>
                <MDTypography variant="h6" fontWeight="medium" color="black" mt={1}>
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
