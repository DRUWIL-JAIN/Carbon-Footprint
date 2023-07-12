
// react-router-dom components
import { Link } from "react-router-dom";

// prop-types is a library for typechecking of props
import PropTypes from "prop-types";

// @mui material components
import Card from "@mui/material/Card";
import CardMedia from "@mui/material/CardMedia";


// Material Dashboard 2 React components
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";

function DefaultProjectCard({ image, label, title, description, weight, carbonFootprint, manufacturingAddress }) {

  return (
    <Card
      sx={{
        display: "flex",
        flexDirection: "column",
        backgroundColor: "transparent",
        boxShadow: "none",
        overflow: "visible",
      }}
    >
      <MDBox position="relative" width="100%" shadow="xl" borderRadius="xl">
        <CardMedia
          src={image}
          component="img"
          title={title}
          style={{
            width: "100%",
            height: "200px",
            backgroundColor: 'powderblue',
            margin: 0,
            boxShadow: ({ boxShadows: { md } }) => md,
            objectFit: "cover",
            objectPosition: "center",
          }}
        />
      </MDBox>
      <MDBox mt={1} mx={0.5}>
        <MDTypography variant="button" fontWeight="regular" color="text" textTransform="capitalize">
          {label}
        </MDTypography>
        <MDBox mb={1}>
          <MDTypography
            component={Link}
            variant="h5"
            textTransform="capitalize"
          >
            {title}
          </MDTypography>
        </MDBox>
        <MDBox mb={2} lineHeight={0}>
          <MDTypography variant="caption" fontWeight="light" color="text">
            {description}
          </MDTypography>
        </MDBox>
        <MDBox lineHeight={0}>
          <MDTypography variant="button" fontWeight="light" color="text">
            {weight}
          </MDTypography>
        </MDBox>
        <MDBox lineHeight={0}>
          <MDTypography variant="button" fontWeight="light" color="text">
            {carbonFootprint}
          </MDTypography>
        </MDBox>
        <MDBox lineHeight={0}>
          <MDTypography variant="button" fontWeight="light" color="text">
            {manufacturingAddress}
          </MDTypography>
        </MDBox>
      </MDBox>
    </Card>
  );
}

// Setting default values for the props of DefaultProjectCard
DefaultProjectCard.defaultProps = {
  authors: [],
};

// Typechecking props for the DefaultProjectCard
DefaultProjectCard.propTypes = {
  image: PropTypes.string.isRequired,
  label: PropTypes.string.isRequired,
  title: PropTypes.string.isRequired,
  description: PropTypes.string.isRequired,
  weight: PropTypes.string.isRequired,
  carbonFootprint: PropTypes.string.isRequired,
  manufacturingAddress: PropTypes.string.isRequired,
};

export default DefaultProjectCard;
