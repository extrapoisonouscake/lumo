import { KnownSchools } from "@/constants/schools";
import { timezonedDayJS } from "@/instances/dayjs";

import "@ungap/with-resolvers";
import { parsePageItems } from "pdf-text-reader";
import { getDocument } from "pdfjs-dist";
import type { TextItem } from "pdfjs-dist/types/src/display/api";
import { announcementsFileParser } from "./parsers";
export async function getAnnouncements(school: KnownSchools, date?: Date) {
  //@ts-ignore
  await import("pdfjs-dist/build/pdf.worker.min.mjs");
  const url = schoolToAnnouncementsFileURL[school](date);

  const response = await fetch(
    url,
    process.env.NODE_ENV !== "development"
      ? { next: { revalidate: false } }
      : {}
  );
console.log(url,response.status)
  if (!response.ok) {
    return;
  }

  const arrayBuffer = await response.arrayBuffer();
  const doc = await getDocument({
    data: new Uint8Array(arrayBuffer),
    disableFontFace: true,
  }).promise;
  const pages = await Promise.all(
    [...Array(+doc.numPages)].map((_, index) => {
      return doc.getPage(index + 1);
    })
  ); // 1-indexed
  const content = await Promise.all(pages.map((page) => page.getTextContent()));
  const items: TextItem[][] = content.map((pageContent) =>
    pageContent.items.filter((item): item is TextItem => "str" in item)
  );
  const lines = items.map((item) => parsePageItems(item).lines).flat();
  const prepareLines = announcementsFileParser[school];
  return prepareLines(lines);
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
