import { cvToJSON } from "@clarigen/core";
import {
  stringAsciiCV,
  createLPString,
  serializeLPString,
  serializeCV,
  uintCV,
  deserializeCV,
  standardPrincipalCV,
} from "micro-stacks/clarity";
import { bytesToHex, utf8ToBytes } from "micro-stacks/common";

const string = "new-name";

// const cv = stringAsciiCV(string);
const lp = createLPString(string);
const lpHex = serializeLPString(lp);

console.log("new-name", bytesToHex(serializeCV(stringAsciiCV(string))));
// console.log("new-name", bytesToHex(utf8ToBytes("new-name")));

const id = 1;
const idHex = serializeCV(uintCV(id));
console.log(bytesToHex(idHex));

const valueCv = deserializeCV(
  "0x0c000000040269640100000000000000000000000000000000046e616d650c00000002046e616d65020000000f636f676e69746976652d736861726b096e616d65737061636502000000087465737461626c65056f776e6572051a7321b74e2b6a7e949e6c4ad313035b166509501705746f7069630d000000086e65772d6e616d65"
);
console.log(cvToJSON(valueCv));

const primaryUpdate = bytesToHex(
  serializeLPString(createLPString("primary-update"))
);
// const primaryUpdate = bytesToHex(serializeCV(stringAsciiCV("primary-update")));
console.log("primaryUpdate", primaryUpdate);

const topic = bytesToHex(serializeLPString(createLPString("topic")));
console.log("topic", topic);

const principal = bytesToHex(
  serializeCV(standardPrincipalCV("ST1SJ3DTE5DN7X54YDH5D64R3BCB6A2AG2ZQ8YPD5"))
);

console.log(principal);

console.log(
  cvToJSON(
    deserializeCV(
      "0x0c00000004076163636f756e74051a7321b74e2b6a7e949e6c4ad313035b16650950170269640a010000000000000000000000000000000004707265760905746f7069630d0000000e7072696d6172792d757064617465"
    )
  )
);

//\x0c000000040269640100000000000000000000000000000000046e616d650c00000002046e616d65020000000f636f676e69746976652d736861726b096e616d65737061636502000000087465737461626c65056f776e6572051a7321b74e2b6a7e949e6c4ad313035b1665095017
// 05746f706963
// 0d000000086e65772d6e616d65
