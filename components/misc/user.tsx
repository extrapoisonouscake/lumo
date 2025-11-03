import { cn } from "@/helpers/cn";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";

export function UserAvatar({
  firstName,
  lastName,
  photoURL,
  className,
}: {
  firstName: string;
  middleName?: string;
  lastName: string;
  photoURL?: string;
  className?: string;
}) {
  return (
    <Avatar
      className={cn(
        "size-8 rounded-full bg-background sm:rounded-lg text-sm",
        className
      )}
    >
      <AvatarImage className="object-cover object-center" src={photoURL} />
      <AvatarFallback
        className="rounded-full sm:rounded-lg text-inherit"
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
}: {
  firstName: string;
  middleName?: string;
  lastName: string;
}) {
  return `${firstName} ${middleName ? `${middleName[0]}. ` : ""} ${lastName}`;
}
