import { cn } from "@/helpers/cn";
import { useStudentDetails } from "@/hooks/trpc/use-student-details";
import { usePathname } from "next/navigation";
import { Link } from "react-router";
import { AppleEmoji } from "../misc/apple-emoji";
import { formatUserFullName, UserAvatar } from "../misc/user";
import { QueryWrapper } from "../ui/query-wrapper";
import { SidebarMenuButton } from "../ui/sidebar";
import { Skeleton } from "../ui/skeleton";

export function UserHeader({ className }: { className?: string }) {
  const query = useStudentDetails();

  return (
    <Link to="/profile" className={className}>
      <UserButton>
        <QueryWrapper
          query={query}
          onError={
            <div className="flex gap-2 items-center">
              <AppleEmoji
                value="‼️"
                textClassName="text-xl leading-none"
                imageClassName="size-5"
              />
              <p className="text-sm text-center">Something went wrong.</p>
            </div>
          }
          skeleton={<UserHeaderSkeleton className={className} />}
        >
          {(data) => {
            const { firstName, middleName, lastName, grade, photoURL } = data;

            return (
              <>
                <UserAvatar
                  firstName={firstName}
                  lastName={lastName}
                  photoURL={photoURL}
                />
                <div className="hidden sm:grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-semibold text-foreground">
                    {formatUserFullName({ firstName, middleName, lastName })}
                  </span>
                  <span className="truncate text-xs text-muted-foreground">
                    Grade {grade}
                  </span>
                </div>
              </>
            );
          }}
        </QueryWrapper>
      </UserButton>
    </Link>
  );
}

export function UserHeaderSkeleton({ className }: { className?: string }) {
  return (
    <>
      <Skeleton className="block min-w-8 size-8 rounded-full sm:rounded-lg" />

      <div className="hidden sm:grid flex-1 gap-1 text-left text-sm leading-tight">
        <Skeleton className="truncate w-fit">
          <span className="font-semibold">Name Name Na</span>
        </Skeleton>
        <Skeleton className="truncate w-fit">
          <span className="text-xs">Grade 11</span>
        </Skeleton>
      </div>
    </>
  );
}
function UserButton({
  className,
  isLoading = false,
  ...props
}: React.ComponentProps<typeof SidebarMenuButton> & { isLoading?: boolean }) {
  const pathname = usePathname();
  return (
    <SidebarMenuButton
      size="lg"
      isActive={!isLoading && pathname === "/profile"}
      className={cn(
        "p-0 h-fit sm:h-12 rounded-full sm:rounded-xl group-data-[state=collapsed]:rounded-lg sm:p-2 data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground",
        className
      )}
      {...props}
    />
  );
}
