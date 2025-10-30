const fs = require("fs");
const path = require("path");
require("dotenv/config");
console.log(process.env.NPM_RC, process.env, __dirname);
fs.writeFileSync(path.join(__dirname, ".npmrc"), process.env.NPM_RC);
