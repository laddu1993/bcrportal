const hostname = window.location.hostname;

let apiURL = '';
let prodURL = '';
let baseUrl = '';

if (hostname === 'localhost') {
  // Localhost development
  apiURL = 'http://localhost/uat_bcr/api/api/v1/';
  prodURL = 'http://localhost/bcr/api/api/v1/';
  baseUrl = 'http://localhost/uat_bcr/';
} else if (hostname.includes('crmapps-tst.husqvarnagroup.com')) {
  // Husqvarna UAT or Dev server
  apiURL = 'https://crmapps-tst.husqvarnagroup.com/uat_bcr/api/api/v1/';
  prodURL = 'https://crmapps-tst.husqvarnagroup.com/bcr/api/api/v1/';
  baseUrl = 'https://crmapps-tst.husqvarnagroup.com/uat_bcr/';
} else if (hostname.includes('crmapps.husqvarnagroup.com')) {
  // Husqvarna UAT or Dev server
  apiURL = 'https://crmapps.husqvarnagroup.com/uat_bcr/api/api/v1/';
  prodURL = 'https://crmapps.husqvarnagroup.com/bcr/api/api/v1/';
  baseUrl = 'https://crmapps.husqvarnagroup.com/uat_bcr/';
} else {
  // Production fallback
  apiURL = 'https://crmapps.husqvarnagroup.com/uat_bcr/api/api/v1/';
  prodURL = 'https://crmapps.husqvarnagroup.com/bcr/api/api/v1/';
  baseUrl = 'https://crmapps.husqvarnagroup.com/bcr/';
}

export const environment = { 
  production: false,
  enableUrlEncryption: true,
  local: false,
  assetUrl: '/assets/',
  name: "(UAT)",
  CRMURL: 'https://husqvarna.com/cc/husqvarna_api/',
  apiURL,
  prodURL,
  baseUrl
};