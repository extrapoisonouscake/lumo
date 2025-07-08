import { cn } from "@/helpers/cn";
import {
  getTextColorForBackground,
  stringToColor,
} from "@/helpers/stringToColor";
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
  const backgroundColor = stringToColor(firstName + lastName);
  return (
    <Avatar
      className={cn("size-8 rounded-full sm:rounded-lg text-sm", className)}
    >
      <AvatarImage className="object-cover object-center" src={photoURL} />
      <AvatarFallback
        className="rounded-full sm:rounded-lg text-inherit"
        style={{
          background: backgroundColor,
          color: getTextColorForBackground(backgroundColor),
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
