// @mui material components
import Grid from "@mui/material/Grid";
import Checkbox from "@mui/material/Checkbox";
import Select from "@mui/material/Select";
import MenuItem from "@mui/material/MenuItem";
import FormControl from "@mui/material/FormControl";

// Material Dashboard 2 React components
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import MDInput from "components/MDInput";
import MDButton from "components/MDButton";
import MDSnackbar from "components/MDSnackbar";

import React, { useState } from 'react';



// Material Dashboard 2 React example components
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import Footer from "examples/Footer";
import DefaultProjectCard from "examples/Cards/ProductCards/DefaultProjectCard";

// Overview page components
import Header from "layouts/products/components/Header";

//firebase
import { doc, updateDoc, getDoc, addDoc, collection, arrayUnion, query, where, getDocs } from "firebase/firestore";
import { db, storage } from "../../firebase";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";

function Overview() {
  const [productName, setProductName] = useState('');
  const [description, setDescription] = useState('');
  const [weight, setWeight] = useState('');
  const [carbonFootprint, setCarbonFootprint] = useState('');
  const [isRawMaterial, setIsRawMaterial] = useState(false);
  const [manufacturingAddress, setManufacturingAddress] = useState('');
  const [image, setImage] = useState(null);
  const [isFetchClicked, setIsFetchClicked] = useState(false);
  const [materialType, setMaterialType] = useState('');
  const [materials, setMaterials] = useState([]);
  const [selectedMaterial, setSelectedMaterial] = useState('');
  const [products, setProducts] = useState([]);

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

  const handleFetchClick = async (checked) => {
    setIsRawMaterial(checked);
    setIsFetchClicked(false);
    setMaterialType('');
  }

  const handleMaterialTypeChange = async (event) => {
    setMaterialType(event.target.value);
    setMaterials([]);
    setSelectedMaterial('');
    setCarbonFootprint('');
    setWeight('');
    const q = query(collection(db, "materials"), where("type", "==", event.target.value));
    const querySnapshot = await getDocs(q);
    querySnapshot.forEach((doc) => {
      setMaterials(prevState => [...prevState, doc.data()]);
    });
  }

  const handleMaterialChange = async (event) => {
    setSelectedMaterial(event.target.value);
    setWeight(event.target.value.unit);
    setCarbonFootprint(event.target.value.carbonFootprint);

  }

  const handleImageChange = (event) => {
    if (event.target.files[0]) {
      setImage(event.target.files[0]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!window.ethereum.selectedAddress) {
      setTitle(["Error", "Please connect Wallet first."]);
      setMessageColor(colors.error);
      openMessage();
      return;
    }

    if(!productName || !description || !weight || !carbonFootprint || !manufacturingAddress || !image){
      setTitle(["Error", "Please fill all the fields."]);
      setMessageColor(colors.error);
      openMessage();
      return;
    }

    const walletAddress = (window.ethereum.selectedAddress).toLowerCase();

    try {

      const docCompanyRef = doc(db, "companies", walletAddress);
      const docCompanySnap = await getDoc(docCompanyRef);
      if (!docCompanySnap.exists()) {
        setTitle(["Error", "Company does not exist."]);
        setMessageColor(colors.error);
        openMessage();
        return;
      }
      else {


        const docRef = await addDoc(collection(db, "products"), {
          productName: productName,
          description: description,
          carbonFootprint: carbonFootprint,
          companyAddress: walletAddress,
          weight: weight,
          isRawMaterial: isRawMaterial,
          manufacturingAddress: manufacturingAddress,
        });

        if (image) {
          const storageRef = ref(storage, 'productImage/' + docRef.id + '.png');

          // 'file' comes from the Blob or File API
          const snapShot = await uploadBytes(storageRef, image);
          console.log(snapShot)
          const url = await getDownloadURL(snapShot.ref);
          console.log(url);
          await updateDoc(docRef, {
            productImage: url,
          }).then(() => {
            console.log("Document successfully updated!");
          }
          ).catch((error) => {
            console.error("Error updating document: ", error);
          }
          );
        }

        await updateDoc(docCompanyRef, {
          products: arrayUnion(docRef.id),
        }).then(() => {
          console.log("Document successfully updated!");
          setTitle(["Success", "Product added successfully."]);
          setMessageColor(colors.success);
          openMessage();
          handleFetchProducts();
        }).catch((error) => {
          console.error("Error updating document: ", error);
        });
      }

    } catch (e) {
      console.error("Error updating document: ", e);
    }
  };

  const handleFetchProducts = async () => {
    
    if (!window.ethereum.selectedAddress) {
      setTitle(["Error", "Please connect Wallet first."]);
      setMessageColor(colors.error);
      openMessage();
      return;
    }
    const walletAddress = (window.ethereum.selectedAddress).toLowerCase();
    const docCompanyRef = doc(db, "companies", walletAddress);
    const docCompanySnap = await getDoc(docCompanyRef);
    if (!docCompanySnap.exists()) {
      setTitle(["Error", "Company does not exist."]);
      setMessageColor(colors.error);
      openMessage();
      return;
    }
    else {

      const products = docCompanySnap.data().products;
      if (products) {
        setProducts([]);
        products.forEach(async (product) => {
          const docProductRef = doc(db, "products", product);
          const docProductSnap = await getDoc(docProductRef);
          if (docProductSnap.exists()) {
            setProducts(prevState => [...prevState, {...docProductSnap.data(), id: product}]);
          }
        });
      }
    }
  }

  useState(() => {
    handleFetchProducts();
  }, []);

  return (
    <DashboardLayout>
      <DashboardNavbar />
      <MDBox mb={2} />
      <Header>
        <MDBox mt={5} mb={3} sx={{
          borderColor: 'grey.500',
          borderRadius: '10px',
          boxShadow: 3,
          width: '100%',
        }}>
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
              Register Product
            </MDTypography>
          </MDBox>
          <MDBox pt={4} pb={3} px={3}>
            <MDBox component="form" role="form">

              <MDBox mb={2}>
                <MDInput
                  type="text"
                  label="Product Name"
                  value={productName}
                  onChange={e => setProductName(e.target.value)}
                  required
                  variant="standard"
                  fullWidth />
              </MDBox>
              <MDBox mb={2} pt={2}>
                <MDInput
                  type="file"
                  onChange={handleImageChange}
                  required
                  variant="standard"
                  fullWidth />
              </MDBox>
              <MDBox display="flex" alignItems="center" ml={-1}>
                <Checkbox
                  checked={isRawMaterial}
                  onChange={(e) => handleFetchClick(e.target.checked)}
                />
                <MDTypography
                  variant="button"
                  fontWeight="regular"
                  color="text"
                  sx={{ cursor: "pointer", userSelect: "none", ml: -1 }}
                >
                  &nbsp;&nbsp;Is this a raw material?&nbsp;
                </MDTypography>
                {isRawMaterial && (
                  <MDTypography
                    component="a"
                    variant="button"
                    fontWeight="bold"
                    color="success"
                    textGradient
                    href="#"
                    onClick={() => setIsFetchClicked(true)}
                  >
                    Fetch from database (Optional)
                  </MDTypography>
                )}
              </MDBox>
              {isFetchClicked && (
                <Grid container spacing={3}>
                  <Grid item xs={6}>
                    <MDBox mb={2} pt={2}>
                      <FormControl fullWidth>
                        <Select
                          displayEmpty
                          inputProps={{ 'aria-label': 'Without label' }}
                          value={materialType}
                          onChange={(e) => handleMaterialTypeChange(e)}
                          sx={{
                            height: '30px',
                          }}
                        >
                          <MenuItem value={''} disabled>Select Type</MenuItem>
                          <MenuItem value={'Plastic'}>Plastic</MenuItem>
                          <MenuItem value={'Wood'}>Wood</MenuItem>
                          <MenuItem value={'Metal'}>Metal</MenuItem>
                        </Select>
                      </FormControl>
                    </MDBox>
                  </Grid>
                  <Grid item xs={6}>
                    <MDBox mb={2} pt={2}>
                      <FormControl fullWidth>
                        <Select
                          displayEmpty
                          inputProps={{ 'aria-label': 'Without label' }}
                          value={selectedMaterial}
                          onChange={(e) => handleMaterialChange(e)}
                          sx={{
                            height: '30px',
                          }}
                        >
                          <MenuItem value={''} disabled>Select Type</MenuItem>
                          {materials.map((material) => (
                            <MenuItem key={material.material} value={material}>{material.material} (CO2 EQ: {material.carbonFootprint})</MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                    </MDBox>
                  </Grid>
                </Grid>
              )}
              <Grid container spacing={3}>
                <Grid item xs={6}>
                  <MDBox mb={2}>
                    <MDInput
                      type="text"
                      label="Description"
                      value={description}
                      onChange={e => setDescription(e.target.value)}
                      required
                      variant="standard"
                      fullWidth />
                  </MDBox>
                </Grid>
                <Grid item xs={6}>
                  <MDBox mb={2}>
                    <MDInput
                      label="Weight (Kg)"
                      value={weight}
                      type='number'
                      step='0.01'
                      onChange={e => setWeight(e.target.value)}
                      required
                      variant="standard"
                      fullWidth />
                  </MDBox>
                </Grid>
              </Grid>
              <Grid container spacing={3}>
                <Grid item xs={6}>
                  <MDBox mb={2}>
                    <MDInput
                      label="Carbon Footprint"
                      value={carbonFootprint}
                      type='number'
                      step='0.01'
                      onChange={e => setCarbonFootprint(e.target.value)}
                      required
                      variant="standard"
                      fullWidth />
                  </MDBox>
                </Grid>
                <Grid item xs={6}>
                  <MDBox mb={2}>
                    <MDInput
                      label="Production Location"
                      value={manufacturingAddress}
                      onChange={e => setManufacturingAddress(e.target.value)}
                      required
                      variant="standard"
                      fullWidth />
                  </MDBox>
                </Grid>
              </Grid>


              <MDBox mb={4}>
                <MDButton variant="gradient" color="success" onClick={handleSubmit} sx={{
                  float: 'right'
                }}>
                  Register
                </MDButton>
              </MDBox>
            </MDBox>
          </MDBox>
        </MDBox>
        <MDBox pt={2} px={2} lineHeight={1.25}>
          <MDTypography variant="h6" fontWeight="medium">
            Your Products
          </MDTypography>
        </MDBox>
        <MDBox p={2}>
          <Grid container spacing={6}>

            {products.map((product) => (

              <Grid item xs={12} md={6} xl={4}>
                <DefaultProjectCard
                  image={product.productImage}
                  label={`ID: ${product.id}`}
                  title={product.productName}
                  description={`Description: ${product.description}`}
                  weight={`Weight: ${product.weight} Kgs`}
                  carbonFootprint={`Carbon Footprint: ${product.carbonFootprint}`}
                  manufacturingAddress={`Manufactured at: ${product.manufacturingAddress}`}
                />
              </Grid>))}
          </Grid>
        </MDBox>
      </Header>
      {renderMessage}
      <Footer />
    </DashboardLayout>
  );
}

export default Overview;
