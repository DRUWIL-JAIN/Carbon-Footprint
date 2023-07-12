import React, { useState, useEffect } from "react";

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
import { doc, updateDoc, getDoc, arrayUnion } from "firebase/firestore";
import { db } from "../../firebase";
import Header from "layouts/clients/components/Header";


function Tables() {
  // const { columns, rows } = authorsTableData();
  const [clients, setClients] = useState([])
  const [clientAddress, setClientAddress] = useState('')
  const [data, setData] = useState({})
  const [findClientName, setFindClientName] = useState('')

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

  const handleFindClient = async (e) => {
    e.preventDefault();
    setFindClientName('')
    try {
      const clientAddressInLower = clientAddress.toLowerCase();
      const client = doc(db, "companies", clientAddressInLower);

      const docSnap = await getDoc(client);
      if (docSnap.exists()) {
        setFindClientName(docSnap.data().companyName)
      }
      else {
        throw new Error("Client company wallet address does not exist");
      }
    }
    catch (error) {
      setMessageColor(colors.error);
      setTitle(["Error", "Client company wallet address does not exist"]);
      openMessage();
    }
  }




  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const walletAddress = (window.ethereum.selectedAddress).toLowerCase();
      const clientAddressInLower = clientAddress.toLowerCase();

      if (clientAddress === "") {
        throw new Error("Client company wallet address cannot be empty");
      }
      if (walletAddress === clientAddressInLower) {
        throw new Error("Client company wallet address cannot be the same as your company wallet address");
      }
      if (clients.includes(clientAddressInLower)) {
        throw new Error("Client company wallet address already exists");
      }
      const me = doc(db, "companies", walletAddress);
      const client = doc(db, "companies", clientAddressInLower);

      const docSnap = await getDoc(client);
      if (docSnap.exists()) {
        await updateDoc(me, {
          clients: arrayUnion(clientAddressInLower)
        }).then(() => {
          console.log("Document successfully updated!");
          setMessageColor(colors.success);
          setTitle(["Success", "Client company successfully linked"]);
          openMessage();
          setData(tempData);
          fetchClients();
        }).catch((error) => {
          console.error("Error updating document: ", error);
        });
      }
      else {
        throw new Error("Client company wallet address does not exist");
      }

    } catch (e) {
      console.error("Error updating document: ", e);
      setMessageColor(colors.error);
      setTitle(["Error", e.message]);
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
      { Header: "Client", accessor: "client", width: "65%", align: "left" },
      { Header: "type", accessor: "function", align: "left" },
      { Header: "status", accessor: "status", align: "center" },
      { Header: "Linked", accessor: "linked", align: "center" },
    ],

    rows: [
    ],
  };

  useEffect(() => {
    setData(tempData);
    fetchClients();
  }, []);

  function fetchClients() {
    const walletAddress = (window.ethereum.selectedAddress).toLowerCase();
    const me = doc(db, "companies", walletAddress);
    getDoc(me).then((meDoc) => {
      if (meDoc.exists()) {
        if (meDoc.data().clients) {
          for (const c of meDoc.data().clients) {

            const clientDataRef = doc(db, "companies", c);
            getDoc(clientDataRef).then((clientDoc) => {
              if (clientDoc.exists()) {
                console.log("Document data:", clientDoc.data());
                const clientData = clientDoc.data();
                setClients((prevState) => [...prevState, c]);
                setData((prevState) => ({
                  ...prevState,
                  rows: [
                    ...prevState.rows,
                    {
                      client: <Author image={clientData.companyLogo} name={clientData.companyName} email={clientData.companyEmail} />,
                      function: <Job title={clientData.companyType} description="" />,
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
                setTitle(["Error", "Error fetching client data"]);
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
        <MDBox mt={5} pb={3} sx={{
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
              Register Client
            </MDTypography>
          </MDBox>
          <MDBox pt={4} pb={3} px={3}>
            <MDBox component="form" role="form">
              <MDBox mb={2}>
                <MDInput
                  label="Client Wallet Address"
                  value={clientAddress}
                  onChange={e => setClientAddress(e.target.value)}
                  required
                  variant="standard"
                  fullWidth />
              </MDBox>

              {findClientName && (
                <MDBox>
                  <MDTypography variant="h6" fontWeight="medium">
                    Client Name : {findClientName}
                  </MDTypography>
                </MDBox>
              )}
              <MDBox mb={4} >
                <MDButton variant="gradient" color="success" onClick={handleSubmit} sx={{
                  float: "right",
                  marginLeft: 1
                }}>
                  Register
                </MDButton>
                <MDButton variant="outlined" color="success" onClick={handleFindClient} sx={{
                  float: "right"
                }}>
                  Search
                </MDButton>
              </MDBox>
            </MDBox>
          </MDBox>
        </MDBox>
        <MDBox pt={2} px={2} lineHeight={1.25}>
          <MDTypography variant="h6" fontWeight="medium">
            Your Clients
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
