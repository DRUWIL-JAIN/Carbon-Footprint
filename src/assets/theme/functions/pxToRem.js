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

/**
  The pxToRem() function helps you to convert a px unit into a rem unit, 
 */

function pxToRem(number, baseNumber = 16) {
  return `${number / baseNumber}rem`;
}

export default pxToRem;