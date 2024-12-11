import { KnownSchools } from "@/constants/schools";
import { timezonedDayJS } from "@/instances/dayjs";
import { unstructuredIO } from "@/instances/unstructured-io";

import "@ungap/with-resolvers";

import * as fs from "fs";
import { PartitionResponse } from "unstructured-client/sdk/models/operations";
import { Strategy } from "unstructured-client/sdk/models/shared";
const extractTextWithLinks = async (pdfUrl: string) => {
  // Fetch the PDF data from the URL
  const response = await fetch(pdfUrl);
  if (!response.ok) {
    throw new Error(`Failed to fetch PDF: ${response.statusText}`);
  }
  const data = await response.arrayBuffer();

  unstructuredIO.general
    .partition({
      partitionParameters: {
        files: {
          content: data,
          fileName: "announcements-.pdf",
        },
        strategy: Strategy.HiRes,
        pdfInferTableStructure: true,
        splitPdfPage: true,
        splitPdfAllowFailed: true,
        splitPdfConcurrencyLevel: 15,
        languages: ["eng"],
      },
    })
    .then((res: PartitionResponse) => {
      console.log(res);
      if (res.statusCode == 200) {
        // Print the processed data's first element only.
        console.log(res.elements?.[0]);

        // Write the processed data to a local file.
        const jsonElements = JSON.stringify(res.elements, null, 2);

        fs.writeFileSync("./pdf.json", jsonElements);
      }
    })
    .catch((e) => {
      if (e.statusCode) {
        console.log(e.statusCode);
        console.log(e.body);
      } else {
        console.log(e);
      }
    });

  return undefined;
};
export async function getAnnouncements(school: KnownSchools, date?: Date) {
  const url = schoolToAnnouncementsFileURL[school](date);
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Failed to fetch PDF: ${response.statusText}`);
  }
  const data = await response.arrayBuffer();
  return undefined;
  // try {
  //   const response = await unstructuredIO.general.partition({
  //     partitionParameters: {
  //       files: {
  //         content: data,
  //         fileName: "announcements-.pdf",
  //       },
  //       strategy: Strategy.HiRes,
  //       pdfInferTableStructure: true,
  //       splitPdfPage: true,
  //       splitPdfAllowFailed: true,
  //       splitPdfConcurrencyLevel: 15,
  //       languages: ["eng"],
  //     },
  //   });

  //   if (response.statusCode !== 200 || !response.elements) return;
  //   // Print the processed data's first element only.

  //   // Write the processed data to a local file.
  //   const prepareLines = dailyAnnouncementsFileParser[school];
  //   return prepareLines(response.elements as PDFParsingPartitionElement[]);
  // } catch {
  //   return undefined;
  // }
}
const schoolToAnnouncementsFileURL: Record<
  KnownSchools,
  (date?: Date) => string
> = {
  [KnownSchools.MarkIsfeld]: (date) => {
    const parsedDate = timezonedDayJS(date);
    const year = parsedDate.year();
    return `https://www.comoxvalleyschools.ca/mark-isfeld-secondary/wp-content/uploads/sites/44/${year}/${
      parsedDate.month() + 1
    }/DA-${parsedDate.format("MMM")}-${parsedDate.date()}-${year}.pdf`;
  },
};
// const readStream = await fetch(
//   "https://www.comoxvalleyschools.ca/mark-isfeld-secondary/wp-content/uploads/sites/44/2024/11/DA-Nov-28-2024.pdf"
// ).then((res) => res.body);
// if (!readStream) {
//   return;
// }
// const inputAsset = await pdfServices.upload({
//   readStream: Readable.fromWeb(readStream as ReadableStream<Uint8Array>),
//   mimeType: MimeType.PDF,
// });
// const params = new ExtractPDFParams({
//   elementsToExtract: [ExtractElementType.TEXT, ExtractElementType.TABLES],
// });

// const job = new ExtractPDFJob({ inputAsset, params });
// const pollingURL = await pdfServices.submit({ job });
// const pdfServicesResponse = await pdfServices.getJobResult({
//   pollingURL,
//   resultType: ExtractPDFResult,
// });

// const resultAsset = pdfServicesResponse.result?.contentJSON;
