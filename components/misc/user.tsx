import { cn } from "@/helpers/cn";
import { PersonalDetails } from "@/types/school";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";

export function UserAvatar({
  firstName,
  lastName,
  photoURL,
  className,
}: Pick<PersonalDetails, "firstName" | "lastName" | "photoURL"> & {
  className?: string;
}) {
  return (
    <Avatar
      className={cn(
        "size-8 rounded-full bg-background sm:rounded-xl text-sm",
        className
      )}
    >
      <AvatarImage className="object-cover object-center" src={photoURL} />
      <AvatarFallback
        className="rounded-full sm:rounded-xl text-inherit"
        style={{
          background: `hsl(var(--brand) / 0.2)`,
          color: `hsl(var(--brand))`,
        }}
      >
        {firstName[0]}
        {lastName[0]}
      </AvatarFallback>
    </Avatar>
  );
}
export function formatUserFullName({
  firstName,
  middleName,
  lastName,
}: Pick<PersonalDetails, "firstName" | "middleName" | "lastName">) {
  return `${firstName} ${middleName ? `${middleName[0]}. ` : ""} ${lastName}`;
}
