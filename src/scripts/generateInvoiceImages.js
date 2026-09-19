// src/scripts/generateInvoiceImages.js
const fs = require('fs');
const path = require('path');

const dir = path.resolve(__dirname, '../assets/invoiceImages'); // <-- was '../src/assets/invoiceImages'

const logoBase64 = fs.readFileSync(path.join(dir, 'Logo.png'), 'base64');
const signBase64 = fs.readFileSync(path.join(dir, 'sign.png'), 'base64');

const output = `// AUTO-GENERATED — run scripts/generateInvoiceImages.js to regenerate
export const Logo = "data:image/png;base64,${logoBase64}";
export const Sign = "data:image/png;base64,${signBase64}";
`;

fs.writeFileSync(path.join(dir, 'index.js'), output);
console.log('invoiceImages/index.js generated');