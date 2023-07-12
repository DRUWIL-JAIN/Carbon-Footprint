import { useState, useEffect, useMemo } from "react";
import { doc, getDoc } from "firebase/firestore";
import { db } from "./firebase";

// react-router components
import { Routes, Route, Navigate, useLocation, useNavigate } from "react-router-dom";

// @mui material components
import { ThemeProvider } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";
import Icon from "@mui/material/Icon";


// Material Dashboard 2 React components
import MDBox from "components/MDBox";

// Material Dashboard 2 React example components
import Sidenav from "examples/Sidenav";
import Configurator from "examples/Configurator";

// Material Dashboard 2 React themes
import theme from "assets/theme";
import themeRTL from "assets/theme/theme-rtl";

// Material Dashboard 2 React Dark Mode themes
import themeDark from "assets/theme-dark";
import themeDarkRTL from "assets/theme-dark/theme-rtl";

// RTL plugins
import rtlPlugin from "stylis-plugin-rtl";
import { CacheProvider } from "@emotion/react";
import createCache from "@emotion/cache";

// Material Dashboard 2 React routes
import routes from "routes";

// Material Dashboard 2 React contexts
import { useMaterialUIController, setMiniSidenav, setOpenConfigurator } from "context";

// Images
import brandWhite from "assets/images/foot.png";
import brandDark from "assets/images/foot.png";

export default function App() {
  const navigate = useNavigate();
  const [controller, dispatch] = useMaterialUIController();
  const {
    miniSidenav,
    direction,
    layout,
    openConfigurator,
    sidenavColor,
    transparentSidenav,
    whiteSidenav,
    darkMode,
  } = controller;
  const [onMouseEnter, setOnMouseEnter] = useState(false);
  const [rtlCache, setRtlCache] = useState(null);
  const { pathname } = useLocation();
  const [count, setCount] = useState(0);
  const notNeedRes = ['/authentication/sign-in', '/authentication/sign-up', '/authentication/forgot-password']

  

  // const data = [
  //   {
  //     "material": "ethylene vinyl acetate copolymer",
  //     "unit": 1,
  //     "carbonFootprint": 2.375967,
  //     "type": "Plastic"
  //   },
  //   {
  //     "material": "packaging film, low density polyethylene",
  //     "unit": 1,
  //     "carbonFootprint": 3.052848,
  //     "type": "Plastic"
  //   },
  //   {
  //     "material": "polyacrylamide",
  //     "unit": 1,
  //     "carbonFootprint": 2.913491,
  //     "type": "Plastic"
  //   },
  //   {
  //     "material": "polycarbonate",
  //     "unit": 1,
  //     "carbonFootprint": 8.682456,
  //     "type": "Plastic"
  //   },
  //   {
  //     "material": "polyethylene terephthalate, granulate, amorphous",
  //     "unit": 1,
  //     "carbonFootprint": 3.267453,
  //     "type": "Plastic"
  //   },
  //   {
  //     "material": "polyethylene terephthalate, granulate, bottle grade",
  //     "unit": 1,
  //     "carbonFootprint": 3.507692,
  //     "type": "Plastic"
  //   },
  //   {
  //     "material": "polyethylene, high density, granulate",
  //     "unit": 1,
  //     "carbonFootprint": 2.196133,
  //     "type": "Plastic"
  //   },
  //   {
  //     "material": "polyethylene, linear low density, granulate",
  //     "unit": 1,
  //     "carbonFootprint": 2.100838,
  //     "type": "Plastic"
  //   },
  //   {
  //     "material": "polyethylene, low density, granulate",
  //     "unit": 1,
  //     "carbonFootprint": 2.376239,
  //     "type": "Plastic"
  //   },
  //   {
  //     "material": "polypropylene, granulate",
  //     "unit": 1,
  //     "carbonFootprint": 2.203877,
  //     "type": "Plastic"
  //   },
  //   {
  //     "material": "polystyrene, expandable",
  //     "unit": 1,
  //     "carbonFootprint": 3.847401,
  //     "type": "Plastic"
  //   },
  //   {
  //     "material": "polyurethane, rigid foam",
  //     "unit": 1,
  //     "carbonFootprint": 4.906519,
  //     "type": "Plastic"
  //   },
  //   {
  //     "material": "polyvinylchloride, bulk polymerised",
  //     "unit": 1,
  //     "carbonFootprint": 2.199775,
  //     "type": "Plastic"
  //   },
  //   {
  //     "material": "polyvinylchloride, emulsion polymerised",
  //     "unit": 1,
  //     "carbonFootprint": 2.660269,
  //     "type": "Plastic"
  //   },
  //   {
  //     "material": "polyvinylchloride, suspension polymerised",
  //     "unit": 1,
  //     "carbonFootprint": 2.041089,
  //     "type": "Plastic"
  //   },
  //   {
  //     "material": "sodium tripolyphosphate",
  //     "unit": 1,
  //     "carbonFootprint": 6.096065,
  //     "type": "Plastic"
  //   },
  //   {
  //     "material": "polydimethylsiloxane production",
  //     "unit": 1,
  //     "carbonFootprint": 16.40443,
  //     "type": "Plastic"
  //   },
  //   {
  //     "material": "Acrylonitrile Butadiene Styrene (ABS)",
  //     "unit": 1,
  //     "carbonFootprint": 3.557832,
  //     "type": "Plastic"
  //   },
  //   {
  //     "material": "EPS Beads",
  //     "unit": 1,
  //     "carbonFootprint": 2.455583,
  //     "type": "Plastic"
  //   },
  //   {
  //     "material": "Ethylene propylene dien elastomer (EPDM)",
  //     "unit": 1,
  //     "carbonFootprint": 3.591449,
  //     "type": "Plastic"
  //   },
  //   {
  //     "material": "EVOH granulates",
  //     "unit": 1,
  //     "carbonFootprint": 7.300058,
  //     "type": "Plastic"
  //   },
  //   {
  //     "material": "Nitrile butadiene rubber (NBR)",
  //     "unit": 1,
  //     "carbonFootprint": 4.512449,
  //     "type": "Plastic"
  //   },
  //   {
  //     "material": "Nylon 6 fiber",
  //     "unit": 1,
  //     "carbonFootprint": 0.81598,
  //     "type": "Plastic"
  //   },
  //   {
  //     "material": "Nylon 6 granulate",
  //     "unit": 1,
  //     "carbonFootprint": 8.126679,
  //     "type": "Plastic"
  //   },
  //   {
  //     "material": "Polybutadiene (PB) granulate",
  //     "unit": 1,
  //     "carbonFootprint": 3.512795,
  //     "type": "Plastic"
  //   },
  //   {
  //     "material": "Polybutylene Terephthalate (PBT) Granulate",
  //     "unit": 1,
  //     "carbonFootprint": 5.211087,
  //     "type": "Plastic"
  //   },
  //   {
  //     "material": "Polyester polyols",
  //     "unit": 1,
  //     "carbonFootprint": 2.016651,
  //     "type": "Plastic"
  //   },
  //   {
  //     "material": "Polyester resin",
  //     "unit": 1,
  //     "carbonFootprint": 3.788087,
  //     "type": "Plastic"
  //   },
  //   {
  //     "material": "Polymethyl methacrylate (PMMA) granulate",
  //     "unit": 1,
  //     "carbonFootprint": 4.480079,
  //     "type": "Plastic"
  //   },
  //   {
  //     "material": "Polyphenylene Sulfide (PPS)",
  //     "unit": 1,
  //     "carbonFootprint": 7.568459,
  //     "type": "Plastic"
  //   },
  //   {
  //     "material": "Polypropylene (PP) fibers",
  //     "unit": 1,
  //     "carbonFootprint": 0.816152,
  //     "type": "Plastic"
  //   },
  //   {
  //     "material": "Polytetrafluoroethylene granulate (PTFE)",
  //     "unit": 1,
  //     "carbonFootprint": 24.70641,
  //     "type": "Plastic"
  //   },
  //   {
  //     "material": "Polyurethane flexible foam",
  //     "unit": 1,
  //     "carbonFootprint": 3.302438,
  //     "type": "Plastic"
  //   },
  //   {
  //     "material": "Polyvinyl Butyral Granulate (PVB)",
  //     "unit": 1,
  //     "carbonFootprint": 4.947935,
  //     "type": "Plastic"
  //   },
  //   {
  //     "material": "Polyvinylidenchloride granulate",
  //     "unit": 1,
  //     "carbonFootprint": 7.521944,
  //     "type": "Plastic"
  //   },
  //   {
  //     "material": "Polyvinylidene fluoride (PVDF)",
  //     "unit": 1,
  //     "carbonFootprint": 8.544887,
  //     "type": "Plastic"
  //   },
  //   {
  //     "material": "Silicone, high viscosity",
  //     "unit": 1,
  //     "carbonFootprint": 5.472672,
  //     "type": "Plastic"
  //   },
  //   {
  //     "material": "Silicone, low viscosity",
  //     "unit": 1,
  //     "carbonFootprint": 5.430176,
  //     "type": "Plastic"
  //   },
  //   {
  //     "material": "Styrene-butadiene rubber (SBR) fiber",
  //     "unit": 1,
  //     "carbonFootprint": 3.847522,
  //     "type": "Plastic"
  //   },
  //   {
  //     "material": "Natural cork",
  //     "unit": 1,
  //     "carbonFootprint": 0.001426,
  //     "type": "Wood"
  //   },
  //   {
  //     "material": "Paper sack",
  //     "unit": 1,
  //     "carbonFootprint": 0.861058,
  //     "type": "Wood"
  //   },
  //   {
  //     "material": "Plywood, indoor use",
  //     "unit": 1,
  //     "carbonFootprint": 0.368235,
  //     "type": "Wood"
  //   },
  //   {
  //     "material": "Plywood, outdoor use",
  //     "unit": 1,
  //     "carbonFootprint": 0.306668,
  //     "type": "Wood"
  //   },
  //   {
  //     "material": "Sanitary and household papers (tissue paper)",
  //     "unit": 1,
  //     "carbonFootprint": 1.363048,
  //     "type": "Wood"
  //   },
  //   {
  //     "material": "Solid board, bleached",
  //     "unit": 1,
  //     "carbonFootprint": 1.240281,
  //     "type": "Wood"
  //   },
  //   {
  //     "material": "kraft paper, unbleached",
  //     "unit": 1,
  //     "carbonFootprint": 1.151272,
  //     "type": "Wood"
  //   },
  //   {
  //     "material": "Aluminium foil",
  //     "unit": 1,
  //     "carbonFootprint": 0.591919,
  //     "type": "Metal"
  //   },
  //   {
  //     "material": "Aluminium ingot mix (high purity)",
  //     "unit": 1,
  //     "carbonFootprint": 24.29959,
  //     "type": "Metal"
  //   },
  //   {
  //     "material": "Aluminium ingot mix",
  //     "unit": 1,
  //     "carbonFootprint": 8.210747,
  //     "type": "Metal"
  //   },
  //   {
  //     "material": "Aluminium sheet",
  //     "unit": 1,
  //     "carbonFootprint": 0.520671,
  //     "type": "Metal"
  //   },
  //   {
  //     "material": "Antimony",
  //     "unit": 1,
  //     "carbonFootprint": 10.52319,
  //     "type": "Metal"
  //   },
  //   {
  //     "material": "Brass fittings",
  //     "unit": 1,
  //     "carbonFootprint": 0.468705,
  //     "type": "Metal"
  //   },
  //   {
  //     "material": "Cast iron",
  //     "unit": 1,
  //     "carbonFootprint": 0.643126,
  //     "type": "Metal"
  //   },
  //   {
  //     "material": "CFF Steel sheet",
  //     "unit": 1,
  //     "carbonFootprint": 2.85101,
  //     "type": "Metal"
  //   },
  //   {
  //     "material": "Cobalt",
  //     "unit": 1,
  //     "carbonFootprint": 36.05336,
  //     "type": "Metal"
  //   },
  //   {
  //     "material": "Copper sheet",
  //     "unit": 1,
  //     "carbonFootprint": 0.492897,
  //     "type": "Metal"
  //   },
  //   {
  //     "material": "Copper strip",
  //     "unit": 1,
  //     "carbonFootprint": 0.492897,
  //     "type": "Metal"
  //   },
  //   {
  //     "material": "Copper tube",
  //     "unit": 1,
  //     "carbonFootprint": 0.775341,
  //     "type": "Metal"
  //   },
  //   {
  //     "material": "Copper Wire",
  //     "unit": 1,
  //     "carbonFootprint": 0.162797,
  //     "type": "Metal"
  //   },
  //   {
  //     "material": "Steel pipe",
  //     "unit": 1,
  //     "carbonFootprint": 0.159847,
  //     "type": "Metal"
  //   },
  //   {
  //     "material": "Ferrochromium",
  //     "unit": 1,
  //     "carbonFootprint": 5.722783,
  //     "type": "Metal"
  //   },
  //   {
  //     "material": "Ferromolybdenum",
  //     "unit": 1,
  //     "carbonFootprint": 4.357405,
  //     "type": "Metal"
  //   },
  //   {
  //     "material": "Ferronickel",
  //     "unit": 1,
  //     "carbonFootprint": 10.83196,
  //     "type": "Metal"
  //   },
  //   {
  //     "material": "Gallium",
  //     "unit": 1,
  //     "carbonFootprint": 16.61712,
  //     "type": "Metal"
  //   },
  //   {
  //     "material": "Gold",
  //     "unit": 1,
  //     "carbonFootprint": 61614.87,
  //     "type": "Metal"
  //   },
  //   {
  //     "material": "Lead",
  //     "unit": 1,
  //     "carbonFootprint": 1.159313,
  //     "type": "Metal"
  //   },
  //   {
  //     "material": "Magnesium",
  //     "unit": 1,
  //     "carbonFootprint": 28.24356,
  //     "type": "Metal"
  //   },
  //   {
  //     "material": "Manganese",
  //     "unit": 1,
  //     "carbonFootprint": 12.45639,
  //     "type": "Metal"
  //   },
  //   {
  //     "material": "Molybdenum",
  //     "unit": 1,
  //     "carbonFootprint": 5.749852,
  //     "type": "Metal"
  //   },
  //   {
  //     "material": "Nickel",
  //     "unit": 1,
  //     "carbonFootprint": 8.265566,
  //     "type": "Metal"
  //   },
  //   {
  //     "material": "Palladium",
  //     "unit": 1,
  //     "carbonFootprint": 20828.02,
  //     "type": "Metal"
  //   },
  //   {
  //     "material": "Reinforced steel (wire)",
  //     "unit": 1,
  //     "carbonFootprint": 0.637021,
  //     "type": "Metal"
  //   },
  //   {
  //     "material": "Indium",
  //     "unit": 1,
  //     "carbonFootprint": 556.0508483,
  //     "type": "Metal"
  //   },
  //   {
  //     "material": "Silver",
  //     "unit": 1,
  //     "carbonFootprint": 319.617,
  //     "type": "Metal"
  //   },
  //   {
  //     "material": "Stainless steel cold rolled",
  //     "unit": 1,
  //     "carbonFootprint": 7.650665,
  //     "type": "Metal"
  //   },
  //   {
  //     "material": "Stainless steel hot rolled",
  //     "unit": 1,
  //     "carbonFootprint": 6.885512,
  //     "type": "Metal"
  //   },
  //   {
  //     "material": "Tin",
  //     "unit": 1,
  //     "carbonFootprint": 5.788257,
  //     "type": "Metal"
  //   }
  //  ]



  // Cache for the rtl
  useMemo(() => {
    const cacheRtl = createCache({
      key: "rtl",
      stylisPlugins: [rtlPlugin],
    });

    setRtlCache(cacheRtl);
  }, []);

  // Open sidenav when mouse enter on mini sidenav
  const handleOnMouseEnter = () => {
    if (miniSidenav && !onMouseEnter) {
      setMiniSidenav(dispatch, false);
      setOnMouseEnter(true);
    }
  };

  // Close sidenav when mouse leave mini sidenav
  const handleOnMouseLeave = () => {
    if (onMouseEnter) {
      setMiniSidenav(dispatch, true);
      setOnMouseEnter(false);
    }
  };

  // Change the openConfigurator state
  const handleConfiguratorOpen = () => setOpenConfigurator(dispatch, !openConfigurator);

  // Setting the dir attribute for the body element
  useEffect(() => {
    document.body.setAttribute("dir", direction);


  }, [direction]);

  useEffect(() => {
    const interval = setInterval(() => {
      setCount(count + 1);
    }, 1000);
    if(!window.ethereum)
    {
      navigate("/authentication/sign-in");
      return;
    }
    if (!window.ethereum.selectedAddress) {
      navigate("/authentication/sign-in");
    }
    return () => clearInterval(interval);
  }, [count]);

  useEffect(() => {
    //check if url is /dashboard
    if(!notNeedRes.includes(pathname)){
    if (window.ethereum.selectedAddress) {
      console.log(window.ethereum.selectedAddress);
      const docRef = doc(db, "companies", window.ethereum.selectedAddress);
      getDoc(docRef).then((doc) => {
        if (doc.exists()) {
          console.log("Document data:", doc.data());
        } else {
          console.log("No such document!");
          navigate("/authentication/sign-up");
        }
      });
      // const docRef2 = collection(db, "materials");
      // for(const d of data){
      //   addDoc(docRef2, d);
      //   console.log("added");
      // }
      
    }
  }
  }, []);


  // Setting page scroll to 0 when changing the route
  useEffect(() => {
    document.documentElement.scrollTop = 0;
    document.scrollingElement.scrollTop = 0;
  }, [pathname]);

  const getRoutes = (allRoutes) =>
    allRoutes.map((route) => {
      if (route.collapse) {
        return getRoutes(route.collapse);
      }

      if (route.route) {
        return <Route exact path={route.route} element={route.component} key={route.key} />;
      }

      return null;
    });

  const configsButton = (
    <MDBox
      display="flex"
      justifyContent="center"
      alignItems="center"
      width="3.25rem"
      height="3.25rem"
      bgColor="white"
      shadow="sm"
      borderRadius="50%"
      position="fixed"
      right="2rem"
      bottom="2rem"
      zIndex={99}
      color="dark"
      sx={{ cursor: "pointer" }}
      onClick={handleConfiguratorOpen}
    >
      <Icon fontSize="small" color="inherit">
        settings
      </Icon>
    </MDBox>
  );

  return direction === "rtl" ? (
    <CacheProvider value={rtlCache}>
      <ThemeProvider theme={darkMode ? themeDarkRTL : themeRTL}>
        <CssBaseline />
        {layout === "dashboard" && (
          <>
            <Sidenav
              color={sidenavColor}
              brand={(transparentSidenav && !darkMode) || whiteSidenav ? brandDark : brandWhite}
              brandName="Material Dashboard 2"
              routes={routes}
              onMouseEnter={handleOnMouseEnter}
              onMouseLeave={handleOnMouseLeave}
            />
            <Configurator />
            {configsButton}
          </>
        )}
        {layout === "vr" && <Configurator />}
        <Routes>
          {getRoutes(routes)}
          <Route path="*" element={<Navigate to="/dashboard" />} />
        </Routes>
      </ThemeProvider>
    </CacheProvider>
  ) : (
    <ThemeProvider theme={darkMode ? themeDark : theme}>
      <CssBaseline />
      {layout === "dashboard" && (
        <>
          <Sidenav
            color={sidenavColor}
            brand={(transparentSidenav && !darkMode) || whiteSidenav ? brandDark : brandWhite}
            brandName="Green Foot"
            routes={routes}
            onMouseEnter={handleOnMouseEnter}
            onMouseLeave={handleOnMouseLeave}
          />
          <Configurator />
          {configsButton}
        </>
      )}
      {layout === "vr" && <Configurator />}
      <Routes>
        {getRoutes(routes)}
        <Route path="*" element={<Navigate to="/dashboard" />} />
      </Routes>
    </ThemeProvider>
  );
}
