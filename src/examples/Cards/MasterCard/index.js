/**
=========================================================
* Material Dashboard 2 React - v2.2.0
=========================================================

* Product Page: https://girhe.com
* Copyright 2023 Team Golf (https://girhe.com)

Coded by www.creative-tim.com

 =========================================================

* The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.
*/

// prop-types is a library for typechecking of props
import PropTypes from "prop-types";

// @mui material components
import Card from "@mui/material/Card";
import Icon from "@mui/material/Icon";

// Material Dashboard 2 React components
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";

// Images
import pattern from "assets/images/illustrations/pattern-tree.svg";
import masterCardLogo from "assets/images/foot.png";

function MasterCard({ color, number, holder, expires }) {
  const numbers = [...`${number}`];



  return (
    <Card
      sx={({ palette: { gradients }, functions: { linearGradient }, boxShadows: { xl } }) => ({
        background: gradients[color]
          ? linearGradient(gradients[color].main, gradients[color].state)
          : linearGradient(gradients.dark.main, gradients.dark.state),
        boxShadow: xl,
        position: "relative",
      })}
    >
      <MDBox
        position="absolute"
        top={0}
        left={0}
        width="100%"
        height="100%"
        opacity={0.2}
        sx={{
          backgroundImage: `url(${pattern})`,
          backgroundSize: "cover",
        }}
      />
      <MDBox position="relative" zIndex={2} p={2}>
        <MDBox color="white" p={1} lineHeight={0} display="inline">
          <Icon fontSize="default">wifi</Icon>
          <MDBox component="img" display="inline-block" sx={{ float: "right" }} src={masterCardLogo} alt="master card" width="50px" mr={2} />
        </MDBox>
        <MDBox mt={2} mb={6} lineHeight={1}>
          <MDTypography variant="button" color="white" fontWeight="regular" opacity={0.8}>
            Block Number
          </MDTypography>
          <MDTypography
            variant="h1"
            color="white"
            fontWeight="medium"
            textTransform="capitalize"
          >
            {holder}
          </MDTypography>
        </MDBox>
        <MDBox lineHeight={1} mb={2}>
          <MDTypography variant="h6" color="white" fontWeight="medium">
            Transaction Hash
          </MDTypography>
          <MDTypography variant="caption" sx={{ display: "block" }} color="white" fontWeight="regular" opacity={0.8}>
            {numbers}
          </MDTypography>
        </MDBox>
        <MDBox lineHeight={1} mb={6}>
          <MDTypography variant="h6" color="white" fontWeight="medium">
            CID
          </MDTypography>
          <MDTypography variant="caption" sx={{ display: "block" }} color="white" fontWeight="regular" opacity={0.8}>
            {expires}
          </MDTypography>
        </MDBox>
        <MDTypography sx={{
          float: "right"
        }} variant="h5" color="white" fontWeight="medium">
          Verified By Green Foot
        </MDTypography>
      </MDBox>
    </Card>
  );
}

// Setting default values for the props of MasterCard
MasterCard.defaultProps = {
  color: "dark",
};

// Typechecking props for the MasterCard
MasterCard.propTypes = {
  color: PropTypes.oneOf(["primary", "secondary", "info", "success", "warning", "error", "dark"]),
  number: PropTypes.number.isRequired,
  holder: PropTypes.string.isRequired,
  expires: PropTypes.string.isRequired,
};

export default MasterCard;
