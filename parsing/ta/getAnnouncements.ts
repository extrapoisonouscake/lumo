import { KnownSchools } from "@/constants/schools";
import dayjs from "dayjs";

import { parsePageItems } from "pdf-text-reader";
import { getDocument } from "pdfjs-dist/legacy/build/pdf.min.mjs";
import type { TextItem } from "pdfjs-dist/types/src/display/api";
import { announcementsFileParser } from "./parsers";
//@ts-ignore
await import("pdfjs-dist/build/pdf.worker.min.mjs");
export async function getAnnouncements(school: KnownSchools, date?: Date) {
  const url = schoolToAnnouncementsFileURL[school](date);
  console.log({ url });
  const response = await fetch(
    url,
    process.env.NODE_ENV !== "development"
      ? { next: { revalidate: false } }
      : {}
  );
  if (!response.ok) {
    throw new Error(
      `Failed to fetch announcements file: ${response.statusText}`
    );
  }

  const arrayBuffer = await response.arrayBuffer();
  const doc = await getDocument({
    data: new Uint8Array(arrayBuffer),
    disableFontFace: true,
  }).promise;
  const pages = await Promise.all(
    [...Array(+doc.numPages)].map((_, index) => {
      console.log({ index });
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
    const parsedDate = dayjs(date);
    const year = parsedDate.year();
    return `https://www.comoxvalleyschools.ca/mark-isfeld-secondary/wp-content/uploads/sites/44/${year}/${
      parsedDate.month() + 1
    }/DA-${parsedDate.format("MMM")}-${parsedDate.date() - 1}-${year}.pdf`;
  },
};
