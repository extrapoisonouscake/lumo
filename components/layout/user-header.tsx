import { isSessionExpiredResponse } from "@/helpers/isSessionExpiredResponse";
import {
  getTextColorForBackground,
  stringToColor,
} from "@/helpers/stringToColor";
import { fetchMyEd } from "@/parsing/myed/fetchMyEd";
import Link from "next/link";
import { ReloginWrapper } from "../relogin-wrapper";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { SidebarMenuButton } from "../ui/sidebar";
import { Skeleton } from "../ui/skeleton";

export async function UserHeader() {
  const data = await fetchMyEd("personalDetails");
  if (isSessionExpiredResponse(data))
    return <ReloginWrapper skeleton={<UserHeaderSkeleton />} />;
  if (!data) return null;
  const { firstName, middleName, lastName } = data;
  const backgroundColor = stringToColor(data.firstName + data.lastName);
  return (
    <Link href="/profile">
      <SidebarMenuButton
        className="group [&>[data-state=open]>div]:gap-2 [&>[data-state=open]>div>p]:invisible"
        size="lg"
      >
        <div className="flex transition-all items-center w-full">
          <Avatar className="size-7">
            <AvatarImage src={data.photoURL} />
            <AvatarFallback
              className="text-sm"
              style={{
                background: backgroundColor,
                color: getTextColorForBackground(backgroundColor),
              }}
            >
              {firstName[0]}
              {lastName[0]}
            </AvatarFallback>
          </Avatar>
          <p className="text-sm">
            {firstName} {middleName ? `${middleName[0]}. ` : ""}
            {lastName}
          </p>
        </div>
      </SidebarMenuButton>
    </Link>
  );
}

export function UserHeaderSkeleton() {
  return (
    <div className="flex gap-2 items-center">
      <Skeleton className="rounded-full size-7" />
      <Skeleton>
        <p className="text-sm">NameNameNam</p>
      </Skeleton>
    </div>
  );
}
