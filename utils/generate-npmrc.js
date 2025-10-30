const fs = require("fs");
const path = require("path");
require("dotenv/config");
fs.writeFileSync(path.join(__dirname, ".npmrc"), process.env.NPM_RC);
