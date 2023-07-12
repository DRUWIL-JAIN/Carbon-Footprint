// Import the NFTStorage class and File constructor from the 'nft.storage' package
import { NFTStorage, Blob } from 'nft.storage'

const  NFT_STORAGE_KEY  = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJkaWQ6ZXRocjoweDM2YzU5OTYyMmMyZmMzRTcyMmIyZEFDNTZlMzY5YzdmRkY1OTlhM2IiLCJpc3MiOiJuZnQtc3RvcmFnZSIsImlhdCI6MTY4ODYzNDc4Mjc1NCwibmFtZSI6IlRlc3RpbmcgQ2FyYm9uIEZvb3RwcmludCJ9.Zs9Q_pMdhCd0TiouwiQjTVBqOFE1dXxvRArMJlb7Wm4";
const client = new NFTStorage({ token: NFT_STORAGE_KEY })


async function uploadJson(jsonString) {
  const blob = new Blob([jsonString], { type: 'application/json' });
  const cid = await client.storeBlob(blob);
  console.log(cid);
  return cid;
}

export { uploadJson };