import { cn } from "@/helpers/cn";
import { usePersonalDetails } from "@/hooks/trpc/use-personal-details";
import { useStudentDetails } from "@/hooks/trpc/use-student-details";
import { PersonalDetails, StudentDetails, UserRole } from "@/types/school";
import { usePathname } from "next/navigation";
import { Link } from "react-router";
import { AppleEmoji } from "../misc/apple-emoji";
import { formatUserFullName, UserAvatar } from "../misc/user";
import { QueryWrapper } from "../ui/query-wrapper";
import { SidebarMenuButton } from "../ui/sidebar";
import { Skeleton } from "../ui/skeleton";
function MinifiedErrorCard({
  emoji,
  message,
}: {
  emoji: string;
  message: string;
}) {
  return (
    <div className="flex gap-2 items-center">
      <AppleEmoji
        value={emoji}
        textClassName="text-xl leading-none"
        imageClassName="size-5"
      />
      <p className="text-sm text-center">{message}</p>
    </div>
  );
}

const getQueryWrapperDefaultOptions = ({
  className,
}: {
  className?: string;
}) => ({
  onError: <MinifiedErrorCard emoji="‼️" message="Something went wrong." />,
  onPaused: <MinifiedErrorCard emoji="🔌" message="You are offline." />,
  skeleton: <UserHeaderSkeleton className={className} />,
});

export function UserHeader({ className }: { className?: string }) {
  const personalDetailsQuery = usePersonalDetails();
  const studentDetailsQuery = useStudentDetails();

  return (
    <Link to="/profile" className={className}>
      <QueryWrapper
        {...getQueryWrapperDefaultOptions({ className })}
        query={personalDetailsQuery}
      >
        {(personalDetails) => {
          const isParent = personalDetails.role === UserRole.Parent;
          return (
            <>
              {isParent && <ParentCard {...personalDetails} />}
              <QueryWrapper
                {...getQueryWrapperDefaultOptions({ className })}
                query={studentDetailsQuery}
              >
                {(data) => <StudentCard {...data} />}
              </QueryWrapper>
            </>
          );
        }}
      </QueryWrapper>
    </Link>
  );
}
function ParentCard({ firstName, lastName }: PersonalDetails) {
  return (
    <SidebarMenuButton
      size="default"
      className="p-0 h-fit sm:h-12 rounded-full sm:rounded-xl group-data-[state=collapsed]:rounded-lg"
    >
      <UserAvatar firstName={firstName} lastName={lastName} />
    </SidebarMenuButton>
  );
}
function StudentCard({
  photoURL,
  firstName,
  middleName,
  lastName,
  grade,
}: StudentDetails) {
  return (
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
  );
}

export function UserHeaderSkeleton({ className }: { className?: string }) {
  return (
    <UserButton>
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
