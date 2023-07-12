// @mui material components
import Grid from "@mui/material/Grid";
import React, { useState, useEffect } from 'react';


// Material Dashboard 2 React components
import MDBox from "components/MDBox";

// Material Dashboard 2 React example components
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import Footer from "examples/Footer";
import ReportsBarChart from "examples/Charts/BarCharts/ReportsBarChart";
import ReportsLineChart from "examples/Charts/LineCharts/ReportsLineChart";
import ComplexStatisticsCard from "examples/Cards/StatisticsCards/ComplexStatisticsCard";

// Data
import reportsBarChartData from "layouts/dashboard/data/reportsBarChartData";
import reportsLineChartData from "layouts/dashboard/data/reportsLineChartData";

// Dashboard components
import Transactions from "layouts/issueToken/components/Transactions";
import DefaultInfoCard from "examples/Cards/InfoCards/DefaultInfoCard";



//firebase
import { doc, getDoc } from "firebase/firestore";
import { db } from "../../firebase";

//web3
import { CONTRACT_ADDRESS } from "../../constant"

function Dashboard() {
  const { sales } = reportsLineChartData;

  const [mintedProducts, setMintedProducts] = useState([]);
  const [mintedTransactions, setMintedTransactions] = useState([]);
  const [totalClients, setTotalClients] = useState(0);

  const fetchMintedProducts = async () => {
    setMintedProducts([]);
    const xhr = new XMLHttpRequest();
    const walletAddress = (window.ethereum.selectedAddress.toLowerCase());
    xhr.open("GET", "https://deep-index.moralis.io/api/v2/" + walletAddress + "/nft?chain=sepolia&format=decimal&media_items=false");
    xhr.setRequestHeader("accept", "application/json");
    xhr.setRequestHeader("X-API-Key", "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJub25jZSI6ImQ3NWMwZWNkLTA0NWQtNGU0Yy05NmY2LTg0NTljZmZkZjJmNiIsIm9yZ0lkIjoiMzQ2MzI1IiwidXNlcklkIjoiMzU2MDA1IiwidHlwZUlkIjoiYjkxZDk0YTYtMDdmZS00NjgwLTlkOWItZmJlNTEyZjliOGYwIiwidHlwZSI6IlBST0pFQ1QiLCJpYXQiOjE2ODgyODI0NjUsImV4cCI6NDg0NDA0MjQ2NX0.ZeKB90GPvHv947vltLHWtNnAu_ubOoKFIMwpt6fg5k4");
    xhr.onload = function () {
      if (xhr.status === 200) {
        const response = JSON.parse(xhr.responseText);
        console.log(response.result);
        response.result.map(async (p) => {
          if ((p.token_address).toString() == CONTRACT_ADDRESS.toLowerCase()) {
            console.log("Product found");
            const realTokenId = p.token_id;


            const docRef = doc(db, "PsuedoToRealToken", realTokenId);
            const document = await getDoc(docRef);
            if (document.exists()) {
              console.log(document.id, " => ", document.data());
              const psuedoTokenId = document.data().psuedoTokenId;
              const cid = document.data().cid;
              console.log(psuedoTokenId);

              const psuedoTokenIdJson = JSON.parse(psuedoTokenId);
              const docProductRef = doc(db, "products", psuedoTokenIdJson.P);
              const docProductSnap = await getDoc(docProductRef);
              let pDetail = null;
              if (docProductSnap.exists()) {
                console.log("Document data:", docProductSnap.data());
                pDetail = { ...docProductSnap.data(), id: docProductSnap.id };
              }
              const docManufacturerRef = doc(db, "companies", psuedoTokenIdJson.M);
              const docManufacturerSnap = await getDoc(docManufacturerRef);
              let mDetail = null;
              if (docManufacturerSnap.exists()) {
                console.log("Document data:", docManufacturerSnap.data());
                mDetail = { ...docManufacturerSnap.data(), id: docManufacturerSnap.id };
              }
              if (pDetail && mDetail) {
                setMintedProducts((products) => [...products, { ...p, psuedoTokenIdJson: psuedoTokenIdJson, pDetail: pDetail, mDetail: mDetail, cid: cid, id: document.id, hash: document.data().hash }]);
              }
            }


          }
        })
      } else {
        console.log(xhr.status);
      }
    };
    xhr.send();
  }


  const fetchMintedTransactions = async () => {
    setMintedTransactions([]);
    const xhr = new XMLHttpRequest();
    const walletAddress = (window.ethereum.selectedAddress.toLowerCase());
    xhr.open("GET", "https://deep-index.moralis.io/api/v2/" + walletAddress + "/nft/transfers?chain=sepolia&format=decimal&media_items=false");
    xhr.setRequestHeader("accept", "application/json");
    xhr.setRequestHeader("X-API-Key", "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJub25jZSI6ImQ3NWMwZWNkLTA0NWQtNGU0Yy05NmY2LTg0NTljZmZkZjJmNiIsIm9yZ0lkIjoiMzQ2MzI1IiwidXNlcklkIjoiMzU2MDA1IiwidHlwZUlkIjoiYjkxZDk0YTYtMDdmZS00NjgwLTlkOWItZmJlNTEyZjliOGYwIiwidHlwZSI6IlBST0pFQ1QiLCJpYXQiOjE2ODgyODI0NjUsImV4cCI6NDg0NDA0MjQ2NX0.ZeKB90GPvHv947vltLHWtNnAu_ubOoKFIMwpt6fg5k4");
    xhr.onload = function () {
      if (xhr.status === 200) {
        const response = JSON.parse(xhr.responseText);
        console.log(response.result);
        response.result.map(async (p) => {
          if ((p.token_address).toString() == CONTRACT_ADDRESS.toLowerCase()) {
            const realTokenId = p.token_id;


            const docRef = doc(db, "PsuedoToRealToken", realTokenId);
            const document = await getDoc(docRef);
            if (document.exists()) {
              console.log(document.id, " => ", document.data());
              const psuedoTokenId = document.data().psuedoTokenId;

              const psuedoTokenIdJson = JSON.parse(psuedoTokenId);
              const docProductRef = doc(db, "products", psuedoTokenIdJson.P);
              const docProductSnap = await getDoc(docProductRef);
              let pDetail = null;
              if (docProductSnap.exists()) {
                console.log("Document data:", docProductSnap.data());
                pDetail = docProductSnap.data();
              }
              if (pDetail) {
                setMintedTransactions((transactions) => [...transactions, { ...p, name: pDetail.productName }])
              }
            }
          }
        })
      } else {
        console.log(xhr.status);
      }
    };
    xhr.send();
  }

  const fetchAllClient = async () => {
    setTotalClients(0);
    const walletAddress = (window.ethereum.selectedAddress.toLowerCase());
    const docRef = doc(db, "companies", walletAddress);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      console.log("Document data:", docSnap.data());
      if (!docSnap.data().clients) {
        return;
      }
      if (docSnap.data().clients.length > 0) {

        docSnap.data().clients.map(async (p) => {
          const docRef = doc(db, "companies", p);
          const docSnap = await getDoc(docRef);
          if (docSnap.exists()) {
            console.log("Document data:", docSnap.data());
            setTotalClients((totalClients) => totalClients + 1);
          }
        })
      }

    } else {
      // doc.data() will be undefined in this case
      console.log("No such document!");
    }
  }

  useEffect(() => {
    fetchMintedProducts();
    fetchMintedTransactions();
    fetchAllClient();
  }, []);

  return (
    <DashboardLayout>
      <DashboardNavbar />
      <MDBox py={3}>
        <Grid container spacing={3}>
          <Grid item xs={12} md={6} lg={3}>
            <MDBox mb={1.5}>
              <ComplexStatisticsCard
                color="dark"
                icon="weekend"
                title="Bookings"
                count={281}
                percentage={{
                  color: "success",
                  amount: "+55%",
                  label: "than lask week",
                }}
              />
            </MDBox>
          </Grid>
          <Grid item xs={12} md={6} lg={3}>
            <MDBox mb={1.5}>
              <ComplexStatisticsCard
                icon="leaderboard"
                title="Total Transactions"
                count={mintedTransactions.length}
                percentage={{
                  color: "success",
                  amount: "+3%",
                  label: "than last month",
                }}
              />
            </MDBox>
          </Grid>
          <Grid item xs={12} md={6} lg={3}>
            <MDBox mb={1.5}>
              <ComplexStatisticsCard
                color="success"
                icon="store"
                title="Inventory"
                count={mintedProducts.length}
                percentage={{
                  color: "success",
                  amount: "+1%",
                  label: "than yesterday",
                }}
              />
            </MDBox>
          </Grid>
          <Grid item xs={12} md={6} lg={3}>
            <MDBox mb={1.5}>
              <ComplexStatisticsCard
                color="primary"
                icon="person_add"
                title="Clients"
                count={totalClients}
                percentage={{
                  color: "success",
                  amount: "",
                  label: "Just updated",
                }}
              />
            </MDBox>
          </Grid>
        </Grid>
        <MDBox mt={4.5}>
          <Grid container spacing={3}>
            <Grid item xs={12} md={8} lg={8}>
              <Grid container spacing={3}>
                <Grid item xs={12} md={6} lg={6}>
                  <MDBox mb={3}>
                    <ReportsBarChart
                      color="info"
                      title="website views"
                      description="Last Campaign Performance"
                      date="campaign sent 2 days ago"
                      chart={reportsBarChartData}
                    />
                  </MDBox>
                </Grid>
                <Grid item xs={12} md={6} lg={6}>
                  <MDBox mb={3}>
                    <ReportsLineChart
                      color="success"
                      title="daily sales"
                      description={
                        <>
                          (<strong>+15%</strong>) increase in today sales.
                        </>
                      }
                      date="updated 4 min ago"
                      chart={sales}
                    />
                  </MDBox>
                </Grid>
              </Grid>
              <Grid container spacing={3}>
                {mintedProducts.map((product) => (
                  <Grid item xs={12} lg={6} xl={3}>
                    <DefaultInfoCard
                      icon={product.pDetail.productImage}
                      title={product.pDetail.productName}
                      description={product.mDetail.companyName}
                      hash={product.hash}
                      value={"Qty: " + product.amount}
                      cid={product.cid}
                    />
                  </Grid>
                ))}
              </Grid>
            </Grid>
            <Grid item xs={12} md={4} lg={4}>
              <Transactions transaction={mintedTransactions} />
            </Grid>
          </Grid>
        </MDBox>
      </MDBox>
      <Footer />
    </DashboardLayout>
  );
}

export default Dashboard;
