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
import Header from "layouts/mixNCreate/components/Header";




//firebase
import { doc, updateDoc, getDoc, collection, query, where, getDocs, setDoc } from "firebase/firestore";
import { db } from "../../firebase";

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
  const [quantity, setQuantity] = useState('');
  const [cid, setCid] = useState('');
  const [me, setMe] = useState('');
  const [tokenIssued, setTokenIssued] = useState(false);
  const [open, setOpen] = React.useState(false);
  const [progress, setProgress] = useState(0);
  const [currentState, setCurrentState] = useState("fetching");
  const [mintedProducts, setMintedProducts] = useState([]);
  const [burnNFTs, setBurnNFTs] = useState([]);
  const [mintQuantity, setMintQuantity] = useState('');
  const [newMyProduct, setNewMyProduct] = useState('');
  const [allMyProducts, setAllMyProducts] = useState([]);


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
    fetchAllMyProducts();
    fetchMintedProducts();
  }, []);

  const handleRedirect = (url) => {
    window.open(url, '_blank');
  };



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
    const walletAddress = (window.ethereum.selectedAddress.toLowerCase());
    if (newMyProduct == '' || mintQuantity == '') {
      setMessageColor(colors.error);
      setTitle(["Error", "Please fill all the fields"]);
      openMessage();
    }
    else if (mintQuantity <= 0) {
      setMessageColor(colors.error);
      setTitle(["Error", "Quantity should be greater than 0"]);
      openMessage();
    }
    else if (burnNFTs.length == 0) {
      setMessageColor(colors.error);
      setTitle(["Error", "Please select atleast one product to consume"]);
      openMessage();
    }
    else {
      handleOpen();
      setProgress(5);
      setCurrentState("fetching");
      setTokenIssued(false);
      e.preventDefault();
      if (burnNFTs.length > 0) {

        let psuedoTokenIdJson = {};
        psuedoTokenIdJson.P = newMyProduct.id;
        psuedoTokenIdJson.M = walletAddress;
        const burners = [];

        for (const b of burnNFTs) {
          burners.push({
            id: b.token_id,
            amount: b.quantity,
            cid: b.cid
          })
          if (psuedoTokenIdJson.S) {
            psuedoTokenIdJson.S.push({ id: b.token_id, qt: parseFloat(b.quantity) / parseFloat(mintQuantity) });
          }
          else {
            psuedoTokenIdJson.S = [{ id: b.token_id, qt: parseFloat(b.quantity) / parseFloat(mintQuantity) }];
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

            const burnNFTIds = [];
            const burnNFTAmounts = [];
            for (const b of burners) {
              burnNFTIds.push(String(b.id));
              burnNFTAmounts.push(b.amount);
            }
            setProgress(50);
            setCurrentState("minting");

            console.log(walletAddress, walletAddress, burnNFTIds, String(realTokenId), burnNFTAmounts, String(mintQuantity));
            const receipt = await contract.methods
              .burnNmintBatch(walletAddress, walletAddress, burnNFTIds, String(realTokenId), burnNFTAmounts, String(mintQuantity))
              .send({ from: window.ethereum.selectedAddress });
            setBlockNumber(receipt.blockNumber);
            setTxHash(receipt.transactionHash);
            setEtherscanLink(`https://sepolia.etherscan.io/tx/${receipt.transactionHash}`);
            setTimeout(() => {
              fetchMintedProducts();
            }, 3000);
            setProgress(100);
            setTitle(["Success", "Product minted successfully"]);
            setMessageColor(colors.success);
            openMessage();
            setTokenIssued(true);
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
            const realTokenId = docSnap.data().currentTokenId + 1;
            const burnNFTIds = [];
            const burnNFTAmounts = [];
            for (const b of burners) {
              burnNFTIds.push(String(b.id));
              burnNFTAmounts.push(String(b.amount));
            }

            const requests = [];

            const nftJson = {
              product: newMyProduct.id,
              manufacturer: walletAddress,
            };
            nftJson.totalCarbon = parseFloat(newMyProduct.carbonFootprint);
            nftJson.water = parseFloat(newMyProduct.water);
            nftJson.carbonOffset = parseFloat(parseFloat(newMyProduct.carbonFootprint)*parseFloat(newMyProduct.energy)*0.008);
            nftJson.productDetails = {
              productName: newMyProduct.productName,
              description: newMyProduct.description,
              isRawMaterial: newMyProduct.isRawMaterial,
              weight: newMyProduct.weight,
              carbonFootPrint: parseFloat(newMyProduct.carbonFootprint),
              manufacturingAddress: newMyProduct.manufacturingAddress,
              productImage: newMyProduct.productImage,
              water: parseFloat(product.water),
              renewableEnergy: parseFloat(product.energy),
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
            setProgress(30);
            for (const burner of burners) {
              const requestPromise = new Promise((resolve, reject) => {
                const xhr = new XMLHttpRequest();
                xhr.open('GET', "https://ipfs.io/ipfs/" + burner.cid, true);
                xhr.responseType = 'json';
                xhr.onload = function () {
                  if (xhr.status === 200) {
                    resolve(xhr.response);
                  } else {
                    reject(new Error(`Request failed with status ${xhr.status}`));
                  }
                };
                xhr.onerror = function () {
                  reject(new Error('Request failed'));
                };
                xhr.send();
              });
              requests.push(requestPromise);
            }
            setProgress(40);

            Promise.all(requests)
              .then(async responses => {
                nftJson.supplies = responses;
                let totalCarbon = 0;
                let water = 0;
                let carbonOffset = 0;
                for (const supply in nftJson.supplies) {
                  nftJson.supplies[supply].quantity = burners[supply].amount;
                  const totalCarbonOfSupply = (parseFloat(nftJson.supplies[supply].totalCarbon) * parseFloat(burners[supply].amount));
                  console.log(parseFloat(nftJson.supplies[supply].totalCarbon), parseFloat(burners[supply].amount), totalCarbonOfSupply);
                  totalCarbon += totalCarbonOfSupply;

                  const totalWaterOfSupply = (parseFloat(nftJson.supplies[supply].water) * parseFloat(burners[supply].amount));
                  water += totalWaterOfSupply;

                  const totalCarbonOffsetOfSupply = (parseFloat(nftJson.supplies[supply].carbonOffset) * parseFloat(burners[supply].amount));
                  carbonOffset += totalCarbonOffsetOfSupply;
                }

                nftJson.totalCarbon += (totalCarbon / parseFloat(mintQuantity));
                nftJson.water += (water / parseFloat(mintQuantity));
                nftJson.carbonOffset += (carbonOffset / parseFloat(mintQuantity));
                const nftJsonString = JSON.stringify(nftJson);
                console.log("nftJsonString", nftJson);

                


                setProgress(50);
                setCurrentState("minting");

                console.log(walletAddress, walletAddress, burnNFTIds, String(realTokenId), burnNFTAmounts,  String(mintQuantity));
                const receipt = await contract.methods
                  .burnNmintBatch(walletAddress, walletAddress, burnNFTIds, String(realTokenId), burnNFTAmounts, String(mintQuantity))
                  .send({ from: window.ethereum.selectedAddress });
                setBlockNumber(receipt.blockNumber);
                setTxHash(receipt.transactionHash);
                setEtherscanLink(`https://sepolia.etherscan.io/tx/${receipt.transactionHash}`);

                setProgress(70);
                setCurrentState("storing");
                const CID = await uploadJson(nftJsonString);
                setCid(CID);
                console.log(CID);
                setProgress(95);
                setCurrentState("uploading")
                if (docSnap.exists()) {
                  console.log("Document data:", docSnap.data());
                  await updateDoc(docRef, {
                    currentTokenId: realTokenId
                  });
                  await setDoc(doc(db, "PsuedoToRealToken", String(realTokenId)), {
                    psuedoTokenId: newPsuedoTokenId,
                    hash: hash,
                    cid: CID,
                  });
                }
                setProgress(100);
                setTitle(["Success", "Product minted successfully"]);
                setMessageColor(colors.success);
                openMessage();
                setTokenIssued(true);
                setTimeout(() => {
                  fetchMintedProducts();
                }, 3000);
      
              })
              .catch(error => {
                // Handle errors if any of the requests fail
                console.error(error);
                setMessageColor(colors.error);
                setTitle(["Error", "Error while minting"]);
                openMessage();
                handleClose();

                return;
              });

          }


        } catch (error) {
          console.error('Error creating commit:', error);
          setMessageColor(colors.error);
          setTitle(["Error", error.message]);
          openMessage();
          handleClose();
        }

      }
    }
  };


  const fetchAllMyProducts = async () => {
    setAllMyProducts([]);
    const walletAddress = (window.ethereum.selectedAddress).toLowerCase();
    const docRef = doc(db, "companies", walletAddress);
    const docSnap = await getDoc(docRef);
    let isProductAvailable = false;
    if (docSnap.exists()) {
      console.log("Document data:", docSnap.data());
      setMe(docSnap.data());
      if (docSnap.data().products) {
        await Promise.all(
          docSnap.data().products.map(async (p) => {
            const docRef = doc(db, "products", p);
            const docSnap = await getDoc(docRef);
            if (docSnap.exists() && docSnap.data().isRawMaterial == false) {
              isProductAvailable = true;
              console.log("Document data:", docSnap.data());
              setAllMyProducts((allMyProducts) => [...allMyProducts, { ...docSnap.data(), id: p }]);
            }
          }));
        if (!isProductAvailable) {
          setMessageColor(colors.error);
          setTitle(["Error", "No products (Non Raw material) registered for this company"]);
          openMessage();
        }
      }
      else {
        setMessageColor(colors.error);
        setTitle(["Error", "No products registered for this company"]);
        openMessage();
      }

    }
    else {
      // doc.data() will be undefined in this case
      console.log("No such document!");
    }
  }



  const handleAddToPreset = async (e) => {
    if (quantity == '' || quantity == 0 || quantity > parseInt(product.amount)) {
      alert("Please enter valid quantity");
      return;
    }
    console.log(product);
    setBurnNFTs((burnNFTs) => [...burnNFTs, { ...product, quantity: quantity }]);
    const tempProducts = mintedProducts;
    for (let i = 0; i < tempProducts.length; i++) {
      if (tempProducts[i].token_id == product.token_id) {
        tempProducts.splice(i, 1)
      }
    }
    setMintedProducts(tempProducts);
    setQuantity('');
    setProduct('');
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
              Manufacture
            </MDTypography>
          </MDBox>
          <MDBox pt={4} pb={3} px={3}>
            <MDBox component="form" role="form">
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6} mt={2}>
                  <MDBox pt={2}>
                    <FormControl fullWidth>
                      <Select
                        displayEmpty
                        inputProps={{ 'aria-label': 'Without label' }}
                        value={newMyProduct}
                        onChange={(e) => setNewMyProduct(e.target.value)}
                        sx={{
                          height: '30px',
                        }}
                      >
                        <MenuItem value={''} disabled>Select Product to create</MenuItem>
                        {allMyProducts.map((p) => (
                          <MenuItem key={p.id} value={p}>{p.productName} (Description: {p.description})</MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </MDBox>
                </Grid>
                <Grid item xs={12} sm={6} mt={2}>
                  <MDBox>
                    <MDInput
                      label="Quantity of Product"
                      type="number"
                      required
                      value={mintQuantity}
                      onChange={(e) => setMintQuantity(parseFloat(e.target.value))}
                      variant="standard"
                      fullWidth />
                  </MDBox>
                </Grid>

                <Grid item xs={12} sm={6} pb={1}>
                  <MDBox sx={{
                    borderRadius: '10px',
                    borderWidth: '1px',
                    borderStyle: 'solid',
                    borderColor: '#e0e0e0',
                    height: '100%',
                    padding: '10px',
                  }}>

                    {burnNFTs.map((item, index) => (
                      <MDTypography variant="h6" fontWeight="regular">
                        {item.pDetail.productName} (Qty: {item.quantity}, Manufacturer: {item.mDetail.companyName})
                      </MDTypography>
                    ))}
                  </MDBox>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <MDBox >
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
                        <MenuItem value={''} disabled>Select Product from Inventory</MenuItem>
                        {mintedProducts.map((p) => (
                          <MenuItem key={p.pDetail.id} value={p}>{p.pDetail.productName} (Description: {p.pDetail.description}, Hash: {p.hash.slice(0, 15) + "..."})</MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </MDBox>

                  <MDBox mb={2}>
                    <MDInput
                      label={product ? "Quantity (Max: " + product.amount + ")" : "Quantity"}
                      type="number"
                      required
                      value={quantity}
                      onChange={(e) => setQuantity(parseFloat(e.target.value))}
                      variant="standard"
                      fullWidth />
                  </MDBox>

                  <MDButton variant="outlined" color="success" onClick={handleAddToPreset} sx={{
                    float: 'right',
                  }}>
                    Add to preset
                  </MDButton>
                </Grid>
              </Grid>
              <MDBox mt={2} mb={1} >
                <MDButton variant="gradient" color="success" onClick={handleSubmit} sx={{
                  float: 'right',
                }}>
                  Issue Token
                </MDButton>
              </MDBox>
            </MDBox>
          </MDBox>
        </MDBox>


      </Header>

      {mintedProducts.length > 0 && (
        <MDBox mb={3} mx={3}>
          <MDTypography mb={1} variant="h4" fontWeight="medium" color="textPrimary">
            Tokenized Products (Non Raw Materials)
          </MDTypography>
          <Grid container spacing={3}>
            {mintedProducts.map((product) => {
              return !product.pDetail.isRawMaterial ?
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
                  <MDBox component="img" src={me.companyLogo} alt="logo" sx={{
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
                    <MDButton variant="gradient" color="success" fullWidth onClick={() => handleRedirect("https://ipfs.io/ipfs/" + cid)}>
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
