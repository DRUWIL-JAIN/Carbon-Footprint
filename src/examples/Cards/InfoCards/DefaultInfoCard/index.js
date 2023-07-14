import {useState} from "react";
// prop-types is library for typechecking of props
import PropTypes from "prop-types";

// @mui material components
import Card from "@mui/material/Card";
import Divider from "@mui/material/Divider";
import CardMedia from "@mui/material/CardMedia";
import QRCode from "react-qr-code";


// Material Dashboard 2 React components
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import MDButton from "components/MDButton";

import tokenImg from "assets/images/tokenImg.png";

function DefaultInfoCard({ color, icon, title, description, value, hash, cid }) {
  const [open, setOpen] = useState(false);
  const handleRedirect = () => {
    window.open("https://jsoncrack.com/widget?json=https://ipfs.io/ipfs/" + cid, '_blank');
  };
  return (
    <Card>
      <MDBox component="img" src={tokenImg} alt="token" 
      onClick={() => setOpen(!open)}
      sx={{
        width: "40px",
        position: "absolute",
        top: "2%",
        right: "2%",
      }} />
      {open && (
      <Card sx={{
        width: "80%",
        height: "70%",
        position: "absolute",
        top: "20%",
        right: "10%",
        zIndex: 1,
        justifyContent: "center",
        alignItems: "center",
      }}>
        <QRCode value={cid} psize={256} 
          style={{ height: "80%", maxWidth: "80%", width: "80%", marginTop: "30px", marginBottom: "10px"  }}
          viewBox={`0 0 256 256`} />
        <MDButton variant="contained" color="success" style={{ width: "80%", marginBottom: "10%" }} onClick={handleRedirect}>
          <MDTypography variant="button" color="white" fontWeight="medium" textTransform="capitalize">
            View data
          </MDTypography>
        </MDButton>
      </Card>
      )}
      <MDBox p={2} pt={5} mx={3} display="flex" justifyContent="center">
        <MDBox
          display="grid"
          justifyContent="center"
          alignItems="center"
          bgColor={color}
          color="white"
          width="4rem"
          height="4rem"
          shadow="md"
          borderRadius="lg"
          variant="gradient"
        >
          {/* <Icon fontSize="default">{icon}</Icon> */}
          <CardMedia
            src={icon}
            component="img"
            title={title}
            style={{
              width: "100%",
              height: "100%",
              backgroundColor: 'powderblue',
              margin: 0,
              boxShadow: ({ boxShadows: { md } }) => md,
              objectFit: "cover",
              objectPosition: "center",
            }}
          />
        </MDBox>
      </MDBox>
      <MDBox pb={2} px={2} textAlign="center" lineHeight={1.25}>
        <MDTypography variant="h6" fontWeight="medium" textTransform="capitalize">
          {title}
        </MDTypography>
        {description && (
          <MDTypography variant="h6" color="text" fontWeight="regular" >
            {description}
          </MDTypography>
        )}
        {hash && (
          <MDTypography variant="caption" color="text" fontWeight="regular" >
            {hash.slice(0, 15) + "..."}
          </MDTypography>
        )}
        {description && !value ? null : <Divider />}
        {value && (
          <MDTypography variant="h5" fontWeight="medium">
            {value}
          </MDTypography>
        )}
      </MDBox>
    </Card>
  );
}

// Setting default values for the props of DefaultInfoCard
DefaultInfoCard.defaultProps = {
  color: "info",
  value: "",
  description: "",
};

// Typechecking props for the DefaultInfoCard
DefaultInfoCard.propTypes = {
  color: PropTypes.oneOf(["primary", "secondary", "info", "success", "warning", "error", "dark"]),
  icon: PropTypes.node.isRequired,
  title: PropTypes.string.isRequired,
  description: PropTypes.string,
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
};

export default DefaultInfoCard;
