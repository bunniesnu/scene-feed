import { onRequest } from "../functions/api/parse-instagram.ts";

const request = new Request(
  "http://localhost?url=https://www.instagram.com/rescene_official/p/DdL9pWcEpL3/"
);

const res = await onRequest({ request });
const data = await res.json();

console.log("Status:", res.status);
console.log("Body:", data);