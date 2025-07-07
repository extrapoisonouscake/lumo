import {
  getTextColorForBackground,
  stringToColor,
} from "@/helpers/stringToColor";

import { cn } from "@/helpers/cn";
import { useStudentDetails } from "@/hooks/trpc/use-student-details";
import Link from "next/link";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { QueryWrapper } from "../ui/query-wrapper";
import { SidebarMenuButton } from "../ui/sidebar";
import { Skeleton } from "../ui/skeleton";

export function UserHeader({ className }: { className?: string }) {
  const query = useStudentDetails();

  return (
    <QueryWrapper
      query={query}
      skeleton={<UserHeaderSkeleton className={className} />}
    >
      {(data) => {
        const { firstName, middleName, lastName, grade } = data;
        const backgroundColor = stringToColor(data.firstName + data.lastName);
        return (
          <Link href="/profile" className={className}>
            <UserButton>
              <Avatar className="size-8 rounded-full sm:rounded-lg">
                <AvatarImage
                  className="object-cover object-center"
                  src={data.photoURL}
                />
                <AvatarFallback
                  className="text-sm rounded-full sm:rounded-lg"
                  style={{
                    background: backgroundColor,
                    color: getTextColorForBackground(backgroundColor),
                  }}
                >
                  {firstName[0]}
                  {lastName[0]}
                </AvatarFallback>
              </Avatar>
              <div className="hidden sm:grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-semibold">
                  {firstName} {middleName && `${middleName[0]}. `}
                  {lastName}
                </span>
                <span className="truncate text-xs text-muted-foreground">
                  Grade {grade}
                </span>
              </div>
            </UserButton>
          </Link>
        );
      }}
    </QueryWrapper>
  );
}

export function UserHeaderSkeleton({ className }: { className?: string }) {
  return (
    <UserButton className={cn(className, "hover:bg-transparent")}>
      <Skeleton className="block min-w-8 size-8 rounded-full sm:rounded-lg" />

      <div className="hidden sm:grid flex-1 gap-1 text-left text-sm leading-tight">
        <Skeleton className="truncate w-fit">
          <span className="font-semibold">Name Name Na</span>
        </Skeleton>
        <Skeleton className="truncate w-fit">
          <span className="text-xs">Grade 11</span>
        </Skeleton>
      </div>
    </UserButton>
  );
}
function UserButton({
  className,
  ...props
}: React.ComponentProps<typeof SidebarMenuButton>) {
  return (
    <SidebarMenuButton
      size="lg"
      className={cn(
        "p-0 h-fit sm:h-12 rounded-full sm:rounded-lg sm:p-2 data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground",
        className
      )}
      {...props}
    />
  );
}
