import { INTERNAL_DATE_FORMAT } from "@/constants/core";
import { getMidnight } from "@/helpers/getMidnight";
import { timezonedDayJS } from "@/instances/dayjs";
import { edgeConfig } from "@/instances/edge-config";
import { redis } from "@/instances/redis";
import { utapi } from "@/instances/uploadthing";
import { getAnnouncementsPDFIDRedisHashKey } from "@/parsing/announcements/getAnnouncements";

import { clearPDFsTask } from "@/trigger/clear-pdfs";
import {
  checkSchoolAnnouncementsTask,
  savePDFLink,
} from "@/trigger/parse-announcements";

import { NextRequest, NextResponse } from "next/server";
const POSTMARK_WEBHOOK_IPS = [
  "3.134.147.250",
  "50.31.156.6",
  "50.31.156.77",
  "18.217.206.57",
];
interface PostmarkWebhookPayloadUser {
  Email: string;
  Name: string;
  MailboxHash: string;
}
interface PostmarkWebhookPayload {
  FromName: string;
  MessageStream: string;
  From: string;
  FromFull: PostmarkWebhookPayloadUser;
  To: string;
  ToFull: Array<PostmarkWebhookPayloadUser>;
  Cc: string;
  CcFull: Array<PostmarkWebhookPayloadUser>;
  Bcc: string;
  BccFull: Array<PostmarkWebhookPayloadUser>;
  OriginalRecipient: string;
  Subject: string;
  MessageID: string;
  ReplyTo: string;
  MailboxHash: string;
  Date: string;
  TextBody: string;
  HtmlBody: string;
  StrippedTextReply: string;
  Tag: string;
  Headers: Array<{
    Name: string;
    Value: string;
  }>;
  Attachments: Array<{
    Content: string;
    ContentLength: number;
    Name: string;
    ContentType: string;
    ContentID: string;
  }>;
}
const { ANNOUNCEMENTS_UPLOAD_AUTH_KEY } = process.env;
if (!ANNOUNCEMENTS_UPLOAD_AUTH_KEY)
  throw new Error("ANNOUNCEMENTS_UPLOAD_AUTH_KEY is not set");
export async function POST(request: NextRequest): Promise<Response> {
  const { searchParams } = request.nextUrl;

  const token = searchParams.get("token");
  const ip = request.headers.get("x-forwarded-for");
  // if (
  //   !token ||
  //   token !== ANNOUNCEMENTS_UPLOAD_AUTH_KEY ||
  //   !ip ||
  //   !POSTMARK_WEBHOOK_IPS.includes(ip)
  // )
  //   return NextResponse.json({ message: "Unauthorized" }, { status: 403 });

  const emailData = (await request.json()) as PostmarkWebhookPayload;
  const trustedSenders = await edgeConfig.get(
    "announcementsUploadTrustedSenders"
  );

  const schoolId = trustedSenders[emailData.From.toLowerCase()];
  if (!schoolId)
    return NextResponse.json({ message: "Unauthorized" }, { status: 403 });

  const pdfInBase64 = emailData.Attachments.find(
    (file) => file.ContentType === "application/pdf"
  )?.Content;

  if (!pdfInBase64)
    return NextResponse.json(
      { message: "PDF file not found" },
      { status: 400 }
    );
  const pdfData = Buffer.from(pdfInBase64, "base64");
  const currentDate = new Date();
  const now = timezonedDayJS(currentDate);
  const filename = `da-${schoolId}-${now.format(INTERNAL_DATE_FORMAT)}.pdf`; //?reused?

  const file = new File([pdfData], filename);

  const response = await utapi.uploadFiles(file, { acl: "public-read" });

  if (response.error) {
    return NextResponse.json(
      { message: "Failed to upload file" },
      { status: 500 }
    );
  }
  const pdfKey = response.data.key;
  await Promise.all([
    redis.hset(getAnnouncementsPDFIDRedisHashKey(currentDate), {
      [schoolId]: pdfKey,
    }),
    savePDFLink(schoolId, currentDate, `/announcements/direct/${pdfKey}`),
  ]);
  const midnight = getMidnight(currentDate);

  await Promise.all([
    checkSchoolAnnouncementsTask.trigger({
      school: schoolId,
      date: currentDate,
    }),
    clearPDFsTask.trigger({ date: currentDate }, { delay: midnight.toDate() }),
  ]);
  return new Response(undefined, { status: 204 });
}
