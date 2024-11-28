import {
  PDFServices,
  ServicePrincipalCredentials,
} from "@adobe/pdfservices-node-sdk";

const { PDF_SERVICES_CLIENT_ID, PDF_SERVICES_CLIENT_SECRET } = process.env;
if (!PDF_SERVICES_CLIENT_ID || !PDF_SERVICES_CLIENT_SECRET)
  throw new Error("Invalid environment variables for pdfServices");
const credentials = new ServicePrincipalCredentials({
  clientId: PDF_SERVICES_CLIENT_ID,
  clientSecret: PDF_SERVICES_CLIENT_SECRET,
});
export const pdfServices = new PDFServices({ credentials });
