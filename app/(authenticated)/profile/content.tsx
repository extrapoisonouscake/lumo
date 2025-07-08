"use client";
import { formatUserFullName, UserAvatar } from "@/components/misc/user";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { QueryWrapper } from "@/components/ui/query-wrapper";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/helpers/cn";
import { useStudentDetails } from "@/hooks/trpc/use-student-details";
import { PersonalDetails } from "@/types/school";
import {
  CarIcon,
  DoorClosedIcon,
  GraduationCapIcon,
  HashIcon,
  LockKeyholeIcon,
  LucideIcon,
  PencilIcon,
  SchoolIcon,
  SquareParkingIcon,
  UserIcon,
} from "lucide-react";
import styles from "./styles.module.css";

export default function ProfileContent() {
  const query = useStudentDetails();
  return (
    <QueryWrapper query={query} skeleton={<ProfileContentSkeleton />}>
      {(data) => {
        const {
          studentNumber,
          personalEducationNumber,
          taRoom,
          locker,
          schoolName,
          nextSchoolName,
          graduationYear,
          parkingSpaceNumber,
          licensePlateNumber,
        } = data;
        const shouldShowParking = !!(parkingSpaceNumber || licensePlateNumber);
        return (
          <>
            <ProfileCard {...data} />
            <Sections shouldShowParking={shouldShowParking}>
              <SectionCard
                title="Personal Details"
                icon={UserIcon}
                className="[grid-area:a]"
              >
                <UserProperty
                  label="Student Number"
                  value={studentNumber}
                  icon={HashIcon}
                  iconColor="text-blue-600"
                  iconBackground="bg-blue-600/20"
                />
                <UserProperty
                  label="Personal Education Number"
                  value={personalEducationNumber}
                  icon={HashIcon}
                  iconColor="text-green-500"
                  iconBackground="bg-green-500/20"
                />
                <UserProperty
                  label="Graduation Year"
                  value={graduationYear}
                  icon={GraduationCapIcon}
                  iconColor="text-pink-600"
                  iconBackground="bg-pink-600/20"
                />
                <UserProperty
                  label="Locker"
                  value={locker}
                  icon={LockKeyholeIcon}
                  iconColor="text-purple-600"
                  iconBackground="bg-purple-600/20"
                />
              </SectionCard>
              <SectionCard
                title="School"
                icon={SchoolIcon}
                className="[grid-area:b]"
              >
                <UserProperty
                  label="School Name"
                  value={schoolName}
                  icon={SchoolIcon}
                  iconColor="text-yellow-400"
                  iconBackground="bg-yellow-400/20"
                />
                {nextSchoolName && nextSchoolName !== schoolName && (
                  <UserProperty
                    label="Next School Name"
                    value={nextSchoolName}
                    icon={SchoolIcon}
                    iconColor="text-cyan-600"
                    iconBackground="bg-cyan-600/20"
                  />
                )}
                {taRoom && (
                  <UserProperty
                    label="TA Room"
                    value={taRoom}
                    icon={DoorClosedIcon}
                    iconColor="text-orange-500"
                    iconBackground="bg-orange-500/20"
                  />
                )}
              </SectionCard>
              {shouldShowParking && (
                <SectionCard
                  title="Parking"
                  icon={SquareParkingIcon}
                  className="[grid-area:c]"
                >
                  {parkingSpaceNumber && (
                    <UserProperty
                      label="Parking Space Number"
                      value={parkingSpaceNumber}
                      icon={SquareParkingIcon}
                      iconColor="text-emerald-600"
                      iconBackground="bg-emerald-600/20"
                    />
                  )}
                  {licensePlateNumber && (
                    <UserProperty
                      label="License Plate Number"
                      value={licensePlateNumber}
                      icon={CarIcon}
                      iconColor="text-cyan-600"
                      iconBackground="bg-cyan-600/20"
                    />
                  )}
                </SectionCard>
              )}
            </Sections>
          </>
        );
      }}
    </QueryWrapper>
  );
}
function ProfileCard(data: PersonalDetails) {
  return (
    <Card className="gap-3 md:gap-4 p-5 items-center relative md:flex-row">
      <UserAvatar {...data} className="size-24 text-4xl sm:rounded-full" />
      <div className="flex flex-col gap-1.5 items-center md:items-start">
        <h1 className="text-2xl font-semibold">{formatUserFullName(data)}</h1>
        <div className="flex gap-1.5 flex-wrap">
          <Badge className="text-sm font-normal bg-brand/20 text-brand">
            Grade {data.grade}
          </Badge>
          <Badge variant="outline" className="text-sm font-normal">
            Class of {data.graduationYear}
          </Badge>
        </div>
      </div>
      <Button variant="ghost" className="absolute top-2 right-2 p-2 size-auto">
        <PencilIcon className="size-4" />
      </Button>
    </Card>
  );
}
function ProfileContentSkeleton() {
  return (
    <>
      <Card className="gap-3 md:gap-4 p-5 items-center md:flex-row">
        <Skeleton className="size-24 rounded-full" />
        <div className="flex flex-col gap-1.5 items-center md:items-start">
          <Skeleton>
            <h1 className="text-2xl font-semibold">Name N. NameNan</h1>
          </Skeleton>
          <div className="flex gap-1.5 flex-wrap">
            <Skeleton>
              <Badge className="text-sm font-normal bg-brand/20 text-brand">
                Grade 11
              </Badge>
            </Skeleton>
            <Skeleton>
              <Badge variant="outline" className="text-sm font-normal">
                Class of 2000
              </Badge>
            </Skeleton>
          </div>
        </div>
      </Card>
      <Sections shouldShowParking={false}>
        <SectionCard title="Personal Details" icon={UserIcon}>
          <UserPropertySkeleton />
          <UserPropertySkeleton />
          <UserPropertySkeleton />
          <UserPropertySkeleton />
        </SectionCard>
        <SectionCard title="School" icon={SchoolIcon}>
          <UserPropertySkeleton />
          <UserPropertySkeleton />
        </SectionCard>
      </Sections>
    </>
  );
}
function Sections({
  children,
  shouldShowParking,
}: {
  children: React.ReactNode;
  shouldShowParking: boolean;
}) {
  return (
    <div
      className={cn(
        styles.sectionCards,
        !shouldShowParking && styles.sectionCardsNoParking
      )}
    >
      {children}
    </div>
  );
}
function SectionCard({
  children,
  title,
  icon: Icon,
  className,
}: {
  className?: string;
  children: React.ReactNode;
  title: string;
  icon: LucideIcon;
}) {
  return (
    <Card className={className}>
      <CardHeader className="py-4 px-5 pb-0 flex-row justify-between items-center">
        <CardTitle className="text-xl font-medium">{title}</CardTitle>
        <Icon className="size-5 text-muted-foreground" />
      </CardHeader>
      <CardContent className="p-0">{children}</CardContent>
    </Card>
  );
}
function UserProperty({
  label,
  value,
  icon: Icon,
  iconColor,
  iconBackground,
}: {
  label: string;
  value: string | number | undefined;
  icon: LucideIcon;
  iconColor: string;
  iconBackground: string;
}) {
  return (
    <div className="flex gap-4 py-4 px-5 border-b last:border-b-0 items-center">
      <div className={cn("rounded-full p-2", iconBackground, iconColor)}>
        <Icon className="size-5" />
      </div>
      <div className="flex flex-col gap-0.5">
        <p className="text-sm text-muted-foreground">{label}</p>
        <p>{value ?? "—"}</p>
      </div>
    </div>
  );
}
function UserPropertySkeleton() {
  return (
    <div className="flex gap-4 py-4 px-5 border-b last:border-b-0 items-center">
      <Skeleton className="size-9 rounded-full" />
      <div className="flex flex-col gap-1 items-start">
        <Skeleton>
          <p className="text-sm text-muted-foreground">Label</p>
        </Skeleton>
        <Skeleton>
          <p>100000</p>
        </Skeleton>
      </div>
    </div>
  );
}
