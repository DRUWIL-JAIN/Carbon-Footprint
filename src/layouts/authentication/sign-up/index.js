// react-router-dom components
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

// @mui material components
import Card from "@mui/material/Card";
import Select from "@mui/material/Select";
import MenuItem from "@mui/material/MenuItem";
import FormControl from "@mui/material/FormControl";
import Grid from "@mui/material/Grid";
import MDSnackbar from "components/MDSnackbar";



// Material Dashboard 2 React components
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import MDInput from "components/MDInput";
import MDButton from "components/MDButton";

//firebase
import { doc, setDoc, getDoc } from "firebase/firestore";
import { db, storage } from "../../../firebase";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";



// Authentication layout components
import CoverLayout from "layouts/authentication/components/CoverLayout";

// Images
import bgImage from "assets/images/companyResBG.jpg";
import Footer from "examples/Footer";
import { Typography } from "@mui/material";

function Cover() {
  let navigate = useNavigate();

  const [companyName, setCompanyName] = useState('');
  const [companyAddress, setCompanyAddress] = useState('');
  const [companyScale, setCompanyScale] = useState('');
  const [companyType, setCompanyType] = useState('');
  const [companyZipCode, setCompanyZipCode] = useState('');
  const [companyWebsite, setCompanyWebsite] = useState('');
  const [companyEmail, setCompanyEmail] = useState('');
  const [companyPhone, setCompanyPhone] = useState('');
  const [image, setImage] = useState(null);


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
      title={title[0]?title[0]:""}
      content={title[1]?title[1]:""}
      dateTime=""
      open={message}
      onClose={closeMessage}
      close={closeMessage}
      bgWhite
    />
  );



  const handleImageChange = (event) => {
    if (event.target.files[0]) {
      setImage(event.target.files[0]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if(!companyName || !companyAddress || !companyScale || !companyType || !companyZipCode || !companyWebsite || !companyEmail || !companyPhone){
        setTitle(["Error", "Please fill in all the fields."]);
        setMessageColor(colors.error);
        openMessage();
        return;
      }
      const walletAddress = (window.ethereum.selectedAddress).toLowerCase();
      const docCompanyRef = doc(db, "companies", walletAddress);
      const docCompanySnap = await getDoc(docCompanyRef);
      if (docCompanySnap.exists()) {
        setTitle(["Error", "Company already registered."]);
        setMessageColor(colors.error);
        openMessage();
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
            setTitle(["Success", "Company registered successfully."]);
            setMessageColor(colors.success);
            openMessage();
            setTimeout(() => {
              navigate("/dashboard");
            }, 2000);
        
          }).catch((error) => {
            console.error("Error writing document: ", error);
            setTitle(["Error", "Error writing document."]);
            setMessageColor(colors.error);
            openMessage();
          });
        } catch (error) {
          console.log(error);
          setTitle(["Error", "Error uploading image."]);
          setMessageColor(colors.error);
          openMessage();
        }
      }
    } catch (e) {
      console.error("Error adding document: ", e);
      setTitle(["Error", "Error adding document."]);
      setMessageColor(colors.error);
      openMessage();  
    }
  };



  return (
    <>
      <CoverLayout image={bgImage}>
        <Card>
          <MDBox
            variant="gradient"
            bgColor="info"
            borderRadius="lg"
            coloredShadow="success"
            mx={2}
            mt={-3}
            p={3}
            mb={1}
            textAlign="center"
          >
            <MDTypography variant="h4" fontWeight="medium" color="white" mt={1}>
              Register your company with us
            </MDTypography>
            <MDTypography display="block" variant="button" color="white" my={1}>
              Decarbonization: toward sustainable future
            </MDTypography>
          </MDBox>
          <MDBox pt={4} pb={3} px={3}>
            <MDBox component="form" role="form">
              <Grid container spacing={3}>
                <Grid item xs={12} md={6} lg={6}>
                  <MDBox >
                    <MDInput
                      type="text"
                      label="Company Name"
                      value={companyName}
                      onChange={e => setCompanyName(e.target.value)}
                      required
                      variant="standard"
                      fullWidth />
                  </MDBox>
                </Grid>
                <Grid item xs={12} md={6} lg={6}>
                  <MDBox pt={2}>
                    <MDInput
                      type="file"
                      onChange={handleImageChange}
                      required
                      variant="standard"
                      fullWidth />
                  </MDBox>
                </Grid>
                <Grid item xs={12} md={12} lg={8}>
                  <MDBox >
                    <MDInput
                      type="text"
                      label="Company Address"
                      value={companyAddress}
                      onChange={e => setCompanyAddress(e.target.value)}
                      required
                      variant="standard"
                      fullWidth />
                  </MDBox>
                </Grid>
                <Grid item xs={12} md={6} lg={4}>

                  <MDBox >
                    <MDInput
                      type="text"
                      label="Pin Code"
                      value={companyZipCode}
                      onChange={e => setCompanyZipCode(e.target.value)}
                      required
                      variant="standard"
                      fullWidth />
                  </MDBox>
                </Grid>
                <Grid item xs={12} md={6} lg={6}>
                  <MDBox >
                    <MDInput
                      type="text"
                      label="Website"
                      value={companyWebsite}
                      onChange={e => setCompanyWebsite(e.target.value)}
                      required
                      variant="standard"
                      fullWidth />
                  </MDBox>
                </Grid>
                <Grid item xs={12} md={6} lg={6}>
                  <MDBox >
                    <MDInput
                      type="text"
                      label="Email"
                      value={companyEmail}
                      onChange={e => setCompanyEmail(e.target.value)}
                      required
                      variant="standard"
                      fullWidth />
                  </MDBox>
                </Grid>
                <Grid item xs={12} md={6} lg={4}>
                  <MDBox >
                    <MDInput
                      type="text"
                      label="Phone Number"
                      value={companyPhone}
                      onChange={e => setCompanyPhone(e.target.value)}
                      required
                      variant="standard"
                      fullWidth />
                  </MDBox>
                </Grid>
                <Grid item xs={12} md={6} lg={4}>
                  <MDBox mt={-2} >
                    <Typography variant="caption" color="textPrimary" fontWeight="thin">
                      Company Type
                    </Typography>
                    <FormControl fullWidth>
                      <Select
                        displayEmpty
                        labelId="demo-simple-select-standard-label"
                        id="demo-simple-select-standard"
                        value={companyType}
                        onChange={(e) => setCompanyType(e.target.value)}
                        sx={{
                          height: '30px',
                        }}
                      >
                        <MenuItem value={''} disabled>Select Type</MenuItem>
                        <MenuItem value={'Manufacturer'}>Manufracturer</MenuItem>
                        <MenuItem value={'Logistics'}>Logistics</MenuItem>
                        <MenuItem value={'Retailer'}>Retailer</MenuItem>
                      </Select>
                    </FormControl>
                  </MDBox>
                </Grid>
                <Grid item xs={12} md={6} lg={4}>
                  <MDBox mt={-2}>
                    <Typography variant="caption" color="textPrimary" fontWeight="thin" mb={1}>
                      Company Scale
                    </Typography>
                    <FormControl fullWidth>
                      <Select
                        displayEmpty
                        inputProps={{ 'aria-label': 'Without label' }}
                        value={companyScale}
                        onChange={(e) => setCompanyScale(e.target.value)}
                        sx={{
                          height: '30px',
                        }}
                      >
                        <MenuItem value={''} disabled>Select Type</MenuItem>
                        <MenuItem value={'small'}>Small scale (upto 100)</MenuItem>
                        <MenuItem value={'medium'}>Med scale (100 - 1000)</MenuItem>
                        <MenuItem value={'large'}>Large scale (1000+)</MenuItem>
                      </Select>
                    </FormControl>
                  </MDBox>
                </Grid>
              </Grid>
              <MDBox mt={4} mb={1}>
                <MDButton variant="gradient" color="info" fullWidth onClick={handleSubmit}>
                  Register your Company
                </MDButton>
              </MDBox>
            </MDBox>
          </MDBox>
        </Card>
      </CoverLayout >
      {renderMessage}
      <Footer />
    </>
  );
}

export default Cover;
