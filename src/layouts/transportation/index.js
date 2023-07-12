import React, { useState, useEffect } from "react";
// @mui material components
import Select from "@mui/material/Select";
import MenuItem from "@mui/material/MenuItem";
import FormControl from "@mui/material/FormControl";

// Material Dashboard 2 React components
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import MDInput from "components/MDInput";
import MDButton from "components/MDButton";
import MDSnackbar from "components/MDSnackbar";
import MDAvatar from "components/MDAvatar";
import MDBadge from "components/MDBadge";


// Material Dashboard 2 React example components
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import Footer from "examples/Footer";
import DataTable from "examples/Tables/DataTable";

//firebase
import { doc, updateDoc, getDoc, arrayUnion, addDoc, collection } from "firebase/firestore";
import { db } from "../../firebase";
import Header from "layouts/transportation/components/Header";
import { Grid } from "@mui/material";

import { Typography } from "@mui/material";


function Tables() {
  // const { columns, rows } = authorsTableData();
  const [data, setData] = useState({})
  const [vehicleName, setVehicleName] = useState('');
  const [vehicleType, setVehicleType] = useState('');
  const [carbonFootprintPKMPKG, setCarbonFootprintPKMPKG] = useState('');
  const vehicleTypes = ['Truck', 'Train', 'Ship', 'Airplane'];
  const vehicleLogo = {
    "Ship": "https://upload.wikimedia.org/wikipedia/commons/0/06/Cargo_Ship_Puerto_Cortes.jpg",
    "Truck": "https://upload.wikimedia.org/wikipedia/commons/1/11/Freightliner_M2_106_6x4_2014_%2814240376744%29.jpg",
    "Train": "https://st.adda247.com/https://adda247-wp-multisite-assets.s3.ap-south-1.amazonaws.com/wp-content/uploads/multisite/sites/5/2021/07/13074356/thenewsagency_2021-07_67c19707-a2a0-45db-8161-4ff338d44165_cargo.jpg",
    "Airplane": "https://upload.wikimedia.org/wikipedia/commons/1/1a/An-124_ready.jpg"
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


  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!vehicleName || !vehicleType || !carbonFootprintPKMPKG) {
      setMessageColor(colors.error);
      setTitle(["Error", "Please fill all the fields"]);
      openMessage();
      return;
    }

    try {
      const walletAddress = (window.ethereum.selectedAddress).toLowerCase();

      const docCompanyRef = doc(db, "companies", walletAddress);
      const docCompanySnap = await getDoc(docCompanyRef);
      if (!docCompanySnap.exists()) {
        setMessageColor(colors.error);
        setTitle(["Error", "Company does not exist"]);
        openMessage();
        return;
      }
      else {
        const docRef = await addDoc(collection(db, "transportation"), {
          vehicleName: vehicleName,
          vehicleType: vehicleType,
          carbonFootprintPKMPKG: parseFloat(carbonFootprintPKMPKG),
          company: walletAddress,
        });

        await updateDoc(docCompanyRef, {
          transportation: arrayUnion(docRef.id),
        }).then(() => {
          setMessageColor(colors.success);
          setTitle(["Success", "Transportation added successfully"]);
          openMessage();
          fetchTransportations();
        }).catch((error) => {
          setMessageColor(colors.error);
          setTitle(["Error", "Error updating document"]);
          openMessage();
        });
      }

    } catch (e) {
      setMessageColor(colors.error);
      setTitle(["Error", "Error updating document"]);
      openMessage();
    }

  };
  const Author = ({ image, name, email }) => (
    <MDBox display="flex" alignItems="center" lineHeight={1}>
      <MDAvatar src={image} name={name} size="md" />
      <MDBox ml={2} lineHeight={1}>
        <MDTypography display="block" variant="button" fontWeight="medium">
          {name}
        </MDTypography>
        <MDTypography variant="caption">{email}</MDTypography>
      </MDBox>
    </MDBox>
  );

  const Job = ({ title, description }) => (
    <MDBox lineHeight={1} textAlign="left">
      <MDTypography display="block" variant="caption" color="text" fontWeight="medium">
        {title}
      </MDTypography>
      <MDTypography variant="caption">{description}</MDTypography>
    </MDBox>
  );

  const tempData = {
    columns: [
      { Header: "Name", accessor: "name", width: "45%", align: "left" },
      { Header: "Carbon Footprint (KPK)", accessor: "kpk", align: "left" },
      { Header: "type", accessor: "type", align: "left" },
      { Header: "status", accessor: "status", align: "center" },
      { Header: "Linked", accessor: "linked", align: "center" },
    ],

    rows: [
    ],
  };

  useEffect(() => {
    setData(tempData);
    fetchTransportations();
  }, []);

  function fetchTransportations() {
    const walletAddress = (window.ethereum.selectedAddress).toLowerCase();
    const me = doc(db, "companies", walletAddress);
    getDoc(me).then((meDoc) => {
      if (meDoc.exists()) {
        if (meDoc.data().transportation) {
          setData(tempData);
          for (const t of meDoc.data().transportation) {

            const transportationDataRef = doc(db, "transportation", t);
            getDoc(transportationDataRef).then((transportationDoc) => {
              if (transportationDoc.exists()) {
                console.log("Document data:", transportationDoc.data());
                const transportationData = transportationDoc.data();
                setData((prevState) => ({
                  ...prevState,
                  rows: [
                    ...prevState.rows,
                    {
                      name: <Author image={vehicleLogo[transportationData.vehicleType]} name={transportationData.vehicleName} email={""} />,
                      kpk: <Job title={transportationData.carbonFootprintPKMPKG} description="" />,
                      type: (
                        <MDTypography component="a" href="#" variant="caption" color="text" fontWeight="medium">
                          {transportationData.vehicleType}
                        </MDTypography>
                      ),
                      status: (
                        <MDBox ml={-1}>
                          <MDBadge badgeContent="active" color="success" variant="gradient" size="sm" />
                        </MDBox>
                      ),
                      linked: (
                        <MDTypography component="a" href="#" variant="caption" color="text" fontWeight="medium">
                          14/07/2021
                        </MDTypography>
                      ),

                    }
                  ]
                }))
              } else {
                // doc.data() will be undefined in this case
                console.log("No such document!");
                setTitle(["Error", "Error fetching document"]);
                setMessageColor(colors.error);
                openMessage();
              }
            })
          }
        } else {
          // doc.data() will be undefined in this case
          console.log("No such document!");
        }
      }
    });
  }

  return (
    <DashboardLayout>
      <DashboardNavbar />
      <Header>
        <MDBox mt={5} mb={3} pb={2} sx={{
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
              Register Transportation
            </MDTypography>
          </MDBox>
          <MDBox pt={4} pb={3} px={3}>
            <MDBox component="form" role="form">

              <Grid container spacing={3}>
                <Grid item xs={12} md={4}>
                  <MDBox>
                    <MDInput
                      label="Transportation Name"
                      value={vehicleName}
                      onChange={e => setVehicleName(e.target.value)}
                      required
                      variant="standard"
                      fullWidth />
                  </MDBox>
                </Grid>
                <Grid item xs={12} md={4}>
                  <MDBox >
                    <MDInput
                      label="Carbon Footprint in per Kg per Km"
                      value={carbonFootprintPKMPKG}
                      type='number'
                      step='0.01'
                      onChange={e => setCarbonFootprintPKMPKG(e.target.value)}
                      required
                      variant="standard"
                      fullWidth />
                  </MDBox>
                </Grid>
                <Grid item xs={12} md={4}>
                  <MDBox mt={-2}>
                    <Typography variant="caption" fontWeight="thin">
                      Mode of shipment
                    </Typography>
                    <FormControl fullWidth>
                      <Select
                        displayEmpty
                        inputProps={{ 'aria-label': 'Without label' }}
                        value={vehicleType}
                        onChange={(e) => setVehicleType(e.target.value)}
                        sx={{
                          height: '30px',
                        }}
                      >
                        <MenuItem value={''} disabled>Select transportation type</MenuItem>
                        {vehicleTypes.map((type) => (
                          <MenuItem value={type}>{type}</MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </MDBox>
                </Grid>
              </Grid>



              <MDBox mt={4} mb={1}>
                <MDButton variant="gradient" color="success" onClick={handleSubmit} sx={{
                  float: 'right',
                }}>
                  Register
                </MDButton>
              </MDBox>
            </MDBox>
          </MDBox>
        </MDBox>
        <MDBox pt={2} px={2} lineHeight={1.25}>
          <MDTypography variant="h6" fontWeight="medium">
            Your transportations
          </MDTypography>
        </MDBox>
        <MDBox>
          <DataTable
            table={data.rows?.length > 0 ? data : tempData}
            isSorted={false}
            entriesPerPage={false}
            showTotalEntries={false}
            noEndBorder
          />
        </MDBox>
      </Header>
      {renderMessage}
      <Footer />
    </DashboardLayout>
  );
}

export default Tables;
