import { INTERNAL_DATE_FORMAT } from "@/constants/core";
import { isKnownSchool } from "@/constants/schools";
import { timezonedDayJS } from "@/instances/dayjs";
import { edgeConfig } from "@/instances/edge-config";
import { redis } from "@/instances/redis";
import { utapi } from "@/instances/uploadthing";
import {
  getAnnouncementsPDFRedisHashKey,
  getAnnouncementsRedisIdentificator,
} from "@/parsing/announcements/getAnnouncements";

import { clearPDFsTask } from "@/trigger/clear-pdfs";
import { checkSchoolAnnouncementsTask } from "@/trigger/parse-announcements";

import { NextRequest, NextResponse } from "next/server";

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
  if (!token || token !== ANNOUNCEMENTS_UPLOAD_AUTH_KEY)
    return NextResponse.json({ message: "Unauthorized" }, { status: 403 });
  const schoolId = searchParams.get("school");

  if (!schoolId || !isKnownSchool(schoolId))
    return NextResponse.json(
      { message: "School ID is required" },
      { status: 400 }
    );
  const emailDataPromise = request.json() as Promise<PostmarkWebhookPayload>;
  const [emailData, trustedSenders] = await Promise.all([
    emailDataPromise,
    edgeConfig.get("announcementsUploadTrustedSenders"),
  ]);
  if (!trustedSenders.includes(emailData.From))
    return NextResponse.json(
      { message: "Unauthorized sender" },
      { status: 403 }
    );

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
  const field = getAnnouncementsRedisIdentificator(schoolId, currentDate);

  await redis.hset(getAnnouncementsPDFRedisHashKey(currentDate), {
    [schoolId]: response.data.key,
  });
  const midnight = now.add(1, "day").startOf("day");

  await Promise.all([
    checkSchoolAnnouncementsTask.trigger({
      school: schoolId,
      date: currentDate,
    }),
    clearPDFsTask.trigger({ date: currentDate }, { delay: midnight.toDate() }),
  ]);
  return new Response(undefined, { status: 204 });
}
