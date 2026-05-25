import LibGenerateTestUserSig from "./lib-generate-test-usersig-es.min.js";

let SDKAPPID = 1600138065;

let SECRETKEY =
  "ccd47d7e2c33ccb8eff2fab2178f03864edf7f4699f6f57be885c609608147a2";

/**
 * Expiration time for the signature, it is recommended not to set it too short.
 * Time unit: seconds
 * Default time: 7 x 24 x 60 x 60 = 604800 = 7 days
 */
const EXPIRETIME = 604800;

export function genTestUserSig({ userID, SDKAppID, SecretKey }) {
  if (SDKAppID) SDKAPPID = SDKAppID;
  if (SecretKey) SECRETKEY = SecretKey;
  const generator = new LibGenerateTestUserSig(SDKAPPID, SECRETKEY, EXPIRETIME);
  const userSig = generator.genTestUserSig(userID);

  return {
    SDKAppID: SDKAPPID,
    userSig,
  };
}

export default genTestUserSig;
