"use client";
import { PageHeading } from "@/components/layout/page-heading";
import { TitleManager } from "@/components/misc/title-manager";
import { formatUserFullName, UserAvatar } from "@/components/misc/user";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { QueryWrapper } from "@/components/ui/query-wrapper";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/helpers/cn";
import { useStudentDetails } from "@/hooks/trpc/use-student-details";
import { Gender, StudentDetails } from "@/types/school";

import { IconSvgObject } from "@/types/ui";
import {
  Asterisk02StrokeRounded,
  Calendar03StrokeRounded,
  Car04StrokeRounded,
  CircleLock01StrokeRounded,
  Copy01StrokeRounded,
  Door01StrokeRounded,
  GlobalStrokeRounded,
  GridStrokeRounded,
  Location01StrokeRounded,
  LocationAdd01StrokeRounded,
  Mail02StrokeRounded,
  ParkingAreaSquareStrokeRounded,
  SchoolStrokeRounded,
  Tick02StrokeRounded,
  UserStrokeRounded,
} from "@hugeicons-pro/core-stroke-rounded";
import { HugeiconsIcon } from "@hugeicons/react";
import dayjs from "dayjs";
import { useState } from "react";
import { toast } from "sonner";
import styles from "./styles.module.css";

export default function ProfilePage() {
  const query = useStudentDetails();
  return (
    <>
      <TitleManager>Profile</TitleManager>
      <div className="flex flex-col gap-4">
        <PageHeading />
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
              addresses,
            } = data;
            const shouldShowParking = !!(
              parkingSpaceNumber || licensePlateNumber
            );
            return (
              <>
                <ProfileCard {...data} />
                <Sections shouldShowParking={shouldShowParking}>
                  <SectionCard
                    title="Personal Details"
                    icon={UserStrokeRounded}
                    className="[grid-area:a]"
                  >
                    <div
                      className="group grid grid-cols-1 md:grid-cols-2"
                      data-multifield="true"
                    >
                      <UserProperty
                        label="Student Number"
                        value={studentNumber}
                        icon={GridStrokeRounded}
                        isCopyable
                      />
                      <UserProperty
                        label="Personal Edu. Number"
                        value={personalEducationNumber}
                        icon={GridStrokeRounded}
                        isCopyable
                      />
                    </div>

                    <ParentViewSpecificFields {...data} />
                    <AddressList {...addresses} />
                  </SectionCard>
                  <SectionCard
                    title="School"
                    icon={SchoolStrokeRounded}
                    className="[grid-area:b]"
                  >
                    <UserProperty
                      label="Name"
                      value={schoolName}
                      icon={SchoolStrokeRounded}
                    />
                    {nextSchoolName && nextSchoolName !== schoolName && (
                      <UserProperty
                        label="Next School Name"
                        value={nextSchoolName}
                        icon={SchoolStrokeRounded}
                      />
                    )}
                    <UserProperty
                      label="Graduation Year"
                      value={graduationYear}
                      icon={Calendar03StrokeRounded}
                    />
                    {taRoom && (
                      <UserProperty
                        label="TA Room"
                        value={taRoom}
                        icon={Door01StrokeRounded}
                      />
                    )}
                    <UserProperty
                      label="Locker"
                      value={locker}
                      icon={CircleLock01StrokeRounded}
                    />
                  </SectionCard>
                  {shouldShowParking && (
                    <SectionCard
                      title="Parking"
                      icon={ParkingAreaSquareStrokeRounded}
                      className="[grid-area:c]"
                    >
                      {parkingSpaceNumber && (
                        <UserProperty
                          label="Parking Space Number"
                          value={parkingSpaceNumber}
                          icon={ParkingAreaSquareStrokeRounded}
                        />
                      )}
                      {licensePlateNumber && (
                        <UserProperty
                          label="License Plate Number"
                          value={licensePlateNumber}
                          icon={Car04StrokeRounded}
                        />
                      )}
                    </SectionCard>
                  )}
                </Sections>
              </>
            );
          }}
        </QueryWrapper>
      </div>
    </>
  );
}
function ProfileCard(data: StudentDetails) {
  return (
    <Card className="gap-3 md:gap-4 p-5 items-center md:flex-row mt-5 md:mt-0">
      <UserAvatar
        {...data}
        className="size-24 text-4xl sm:rounded-full -mt-14 md:mt-0"
      />
      <div className="flex flex-col gap-1.5 items-center md:items-start">
        <h1 className="text-2xl font-semibold">{formatUserFullName(data)}</h1>
        <div className="flex gap-1.5 flex-wrap">
          <Badge className="text-sm font-normal bg-brand/10 text-brand">
            Grade {data.grade}
          </Badge>
          <Badge variant="outline" className="text-sm font-normal">
            Class of {data.graduationYear}
          </Badge>
        </div>
      </div>
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
              <Badge className="text-sm font-normal bg-brand/10 text-brand">
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
        <SectionCard title="Personal Details" icon={UserStrokeRounded}>
          <UserPropertySkeleton />
          <UserPropertySkeleton />
          <UserPropertySkeleton />
          <UserPropertySkeleton />
        </SectionCard>
        <SectionCard title="School" icon={SchoolStrokeRounded}>
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
  icon: IconSvgObject;
}) {
  return (
    <Card className={className}>
      <CardHeader className="py-4 px-5 pb-0 flex-row justify-between items-center space-y-0">
        <CardTitle className="text-xl font-medium">{title}</CardTitle>
        <HugeiconsIcon icon={Icon} className="size-5 text-muted-foreground" />
      </CardHeader>
      <CardContent className="p-0">{children}</CardContent>
    </Card>
  );
}
function UserProperty({
  label,
  value,
  icon: Icon,
  isCopyable,
}: {
  label: string;
  value: string | number | undefined;
  icon: IconSvgObject;
  isCopyable?: boolean;
}) {
  return (
    <div className="flex gap-3 py-4 px-5 border-b not-group-data-[multifield=true]:last:border-b-0 items-center">
      <div className="rounded-full p-2 bg-brand/10 text-brand">
        <HugeiconsIcon icon={Icon} className="size-5" />
      </div>
      <div className="flex flex-col gap-0.5">
        <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
          {label}
        </span>
        <div className="flex items-center gap-0.5">
          <p className="text-base">
            {value ?? <span className="italic text-muted-foreground">N/A</span>}
          </p>
          {isCopyable && value && <CopyButton value={value.toString()} />}
        </div>
      </div>
    </div>
  );
}
function CopyButton({ value }: { value: string }) {
  const [isCopied, setIsCopied] = useState(false);
  const Icon = isCopied ? Tick02StrokeRounded : Copy01StrokeRounded;
  return (
    <Button
      size="smallIcon"
      variant="ghost"
      className={cn(
        "text-muted-foreground p-1 size-fit",
        isCopied && "text-brand hover:text-brand"
      )}
      onClick={() => {
        navigator.clipboard.writeText(value.toString());
        toast.success("Copied to clipboard.");
        setIsCopied(true);
        setTimeout(() => {
          setIsCopied(false);
        }, 1000);
      }}
    >
      <HugeiconsIcon icon={Icon} className="size-3.5!" />
    </Button>
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
const addressLabelsVisualData: Record<
  keyof StudentDetails["addresses"],
  { label: string; icon: IconSvgObject }
> = {
  physical: { label: "Physical Address", icon: Location01StrokeRounded },
  mailing: { label: "Mailing Address", icon: Mail02StrokeRounded },
  secondaryPhysical: {
    label: "Secondary Physical Address",
    icon: LocationAdd01StrokeRounded,
  },
  other: { label: "Other Address", icon: GlobalStrokeRounded },
  custom: { label: "Custom Address", icon: Asterisk02StrokeRounded },
};
function AddressList({
  custom,
  ...otherAddresses
}: StudentDetails["addresses"]) {
  return (
    <>
      {Object.entries(otherAddresses).map(([key, value]) => {
        const data =
          addressLabelsVisualData[key as keyof StudentDetails["addresses"]];
        return <UserProperty key={key} value={value} {...data} />;
      })}
      {Object.entries(custom).map(([key, value]) => (
        <UserProperty
          key={key}
          label={key}
          value={value}
          icon={Location01StrokeRounded}
        />
      ))}
    </>
  );
}
const genderMap: Record<Gender, string> = {
  F: "Female",
  M: "Male",
  X: "Other",
};
function ParentViewSpecificFields({ gender, birthDate }: StudentDetails) {
  if (!gender && !birthDate) return null;

  return (
    <div
      className="group grid grid-cols-1 sm:grid-cols-2"
      data-multifield="true"
    >
      <UserProperty
        label="Birthday"
        value={dayjs(birthDate).format("MM/DD/YYYY")}
        icon={Calendar03StrokeRounded}
      />
      <UserProperty
        label="Gender"
        value={genderMap[gender!]}
        icon={UserStrokeRounded}
      />
    </div>
  );
}
