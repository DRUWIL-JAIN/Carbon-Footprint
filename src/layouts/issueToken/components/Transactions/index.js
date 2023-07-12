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

// @mui material components
import { useState } from "react";
import Card from "@mui/material/Card";
// import Divider from "@mui/material/Divider";
import Icon from "@mui/material/Icon";

// Material Dashboard 2 React components
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
// import MDButton from "components/MDButton";

// Billing page components
import Transaction from "layouts/issueToken/components/Transaction";
import MDButton from "components/MDButton";

function Transactions({transaction}) {
  const [count, setCount] = useState(7);
  return (
    <Card sx={{ height: "100%" }}>
      <MDBox display="flex" justifyContent="space-between" alignItems="center" pt={3} px={2}>
        <MDTypography variant="h6" fontWeight="medium" textTransform="capitalize">
          Your Transaction&apos;s
        </MDTypography>
      </MDBox>
      <MDBox pt={3} pb={2} px={2}>
        <MDBox
          component="ul"
          display="flex"
          flexDirection="column"
          p={0}
          m={0}
          sx={{ listStyle: "none" }}
        >
          {transaction.map((item, index) => {
            if(count==index)
            {
              return (
                <MDButton onClick={()=>setCount(index+5)} key={index} color="success" variant="contained" fullWidth>
                  <MDTypography variant="button" color="white" fontWeight="medium" textTransform="capitalize">
                    Show More
                  </MDTypography>
                  <Icon>expand_more</Icon>
                </MDButton>
              );
            }
            else if(count>index)
            return (
            <Transaction
            color="success"
            icon="expand_less"
            name={`(${item.block_number}) `+item.name}
            description={item.block_timestamp}
            value={"amt: " +item.amount}
            key={index}
          />
          )})}
          
        </MDBox>
      </MDBox>
    </Card>
  );
}

export default Transactions;
