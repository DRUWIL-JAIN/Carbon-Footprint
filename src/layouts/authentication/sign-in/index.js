import { useNavigate } from "react-router-dom";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../../../firebase";

// @mui material components
import Card from "@mui/material/Card";


// Material Dashboard 2 React components
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import MDButton from "components/MDButton";
import MDSnackbar from "components/MDSnackbar";

// Authentication layout components
import BasicLayout from "layouts/authentication/components/BasicLayout";

// Images
import bgImage from "assets/images/loginBG.jpg";

import { useState } from "react";

function Basic() {
  let navigate = useNavigate();

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



    const connectWallet = async () => {
    if (window.ethereum) {
      try {
        await window.ethereum.request({ method: 'eth_requestAccounts' });
        if (window.ethereum.selectedAddress) {
          console.log(window.ethereum.selectedAddress);
          const docRef = doc(db, "companies", (window.ethereum.selectedAddress).toLowerCase());
          getDoc(docRef).then((doc) => {
            if (doc.exists()) {
              console.log("Document data:", doc.data());
              navigate("/dashboard");
            } else {
              console.log("No such document!");
              navigate("/authentication/sign-up");
            }
          });
        }
        
      } catch (error) {
        console.error(error);
      }
    } else {
      console.error('Please install Metamask');
      setTitle(["Error", "Please install Wallet first."]);
      setMessageColor(colors.error);
      openMessage();
      return;
    }

  };

  return (
    <BasicLayout image={bgImage}>
      <Card>
        <MDBox
          variant="gradient"
          bgColor="info"
          borderRadius="lg"
          coloredShadow="info"
          mx={2}
          mt={-3}
          p={2}
          mb={1}
          textAlign="center"
        >
          <MDTypography variant="h4" fontWeight="medium" color="white" mt={1}>
            Sign in
          </MDTypography>
        </MDBox>
        <img src='/images/MetaMask.png' alt="MetaMask" />
        <MDBox pt={1} pb={3} px={3}>
          <MDBox component="form" role="form">
            <MDBox mt={1} mb={1}>
              <MDButton variant="gradient" color="info" fullWidth onClick={connectWallet}>
                Connect using Wallet
              </MDButton>
            </MDBox>
          </MDBox>
        </MDBox>
      </Card>
      {renderMessage}
    </BasicLayout>
  );
}

export default Basic;
