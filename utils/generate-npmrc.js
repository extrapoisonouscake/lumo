const fs = require("fs");
const path = require("path");
fs.writeFileSync(path.join(process.cwd(), ".npmrc"), process.env.NPM_RC);
