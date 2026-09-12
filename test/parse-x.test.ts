import { onRequest } from "../functions/api/parse-x.ts";

const request = new Request(
  "http://localhost?url=https://x.com/wonaji_525/status/2098418602433274133"
);

const res = await onRequest({ request });
const data = await res.json();

console.log("Status:", res.status);
console.log("Body:", data);