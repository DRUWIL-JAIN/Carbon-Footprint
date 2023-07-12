// Material Dashboard 2 React components
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import MDAvatar from "components/MDAvatar";
import MDBadge from "components/MDBadge";

// Images
import team2 from "assets/images/team-2.jpg";




export default function data() {
  const Author = ({ image, name, email }) => (
    <MDBox display="flex" alignItems="center" lineHeight={1}>
      <MDAvatar src={image} name={name} size="sm" />
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

  return {
    columns: [
      { Header: "Client", accessor: "client", width: "65%", align: "left" },
      { Header: "type", accessor: "function", align: "left" },
      { Header: "status", accessor: "status", align: "center" },
      { Header: "Linked", accessor: "linked", align: "center" },
    ],

    rows: [
      {
        client: <Author image={team2} name="John Michael" email="john@creative-tim.com" />,
        function: <Job title="Manager" description="" />,
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
      },
    ],
  };
}
