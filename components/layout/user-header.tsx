import { cn } from "@/helpers/cn";
import { useStudentDetails } from "@/hooks/trpc/use-student-details";
import { usePathname } from "next/navigation";
import { Link } from "react-router";
import { formatUserFullName, UserAvatar } from "../misc/user";
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
        const { firstName, middleName, lastName, grade, photoURL } = data;

        return (
          <Link to="/profile" className={className}>
            <UserButton>
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
            </UserButton>
          </Link>
        );
      }}
    </QueryWrapper>
  );
}

export function UserHeaderSkeleton({ className }: { className?: string }) {
  return (
    <UserButton isLoading className={cn(className, "hover:bg-transparent")}>
      <Skeleton className="block min-w-8 size-8 rounded-full sm:rounded-xl" />

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
