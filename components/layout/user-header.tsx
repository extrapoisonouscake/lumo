import {
  getTextColorForBackground,
  stringToColor,
} from "@/helpers/stringToColor";

import { usePersonalDetails } from "@/hooks/trpc/usePersonalDetails";
import Link from "next/link";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { QueryWrapper } from "../ui/query-wrapper";
import { SidebarMenuButton } from "../ui/sidebar";
import { Skeleton } from "../ui/skeleton";

export function UserHeader() {
  const query = usePersonalDetails();
  return (
    <QueryWrapper query={query} skeleton={<UserHeaderSkeleton />}>
      {(data) => {
        const { firstName, middleName, lastName, grade } = data;
        const backgroundColor = stringToColor(data.firstName + data.lastName);
        return (
          <Link href="/profile">
            <SidebarMenuButton
              size="lg"
              className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
            >
              <Avatar className="size-8 rounded-lg">
                <AvatarImage
                  className="object-cover object-center"
                  src={data.photoURL}
                />
                <AvatarFallback
                  className="text-sm rounded-lg"
                  style={{
                    background: backgroundColor,
                    color: getTextColorForBackground(backgroundColor),
                  }}
                >
                  {firstName[0]}
                  {lastName[0]}
                </AvatarFallback>
              </Avatar>
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-semibold">
                  {firstName} {middleName ? `${middleName[0]}. ` : ""}
                  {lastName}
                </span>
                <span className="truncate text-xs">Grade {grade}</span>
              </div>
            </SidebarMenuButton>
          </Link>
        );
      }}
    </QueryWrapper>
  );
}

export function UserHeaderSkeleton() {
  return (
    <SidebarMenuButton
      size="lg"
      className="pointer-events-none data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
    >
      <Skeleton className="size-8 min-w-8 rounded-lg" />

      <div className="grid flex-1 gap-1 text-left text-sm leading-tight">
        <Skeleton className="truncate w-fit">
          <span className="font-semibold">Name Name Na</span>
        </Skeleton>
        <Skeleton className="truncate w-fit">
          <span className="text-xs">Grade 11</span>
        </Skeleton>
      </div>
    </SidebarMenuButton>
  );
}
