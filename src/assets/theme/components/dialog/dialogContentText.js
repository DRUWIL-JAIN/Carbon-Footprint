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

// Material Dashboard 2 React base styles
import typography from "assets/theme/base/typography";
import colors from "assets/theme/base/colors";

// Material Dashboard 2 React helper functions
// import pxToRem from "assets/theme/functions/pxToRem";

const { size } = typography;
const { text } = colors;

const dialogContentText = {
  styleOverrides: {
    root: {
      fontSize: size.md,
      color: text.main,
    },
  },
};

export default dialogContentText;
