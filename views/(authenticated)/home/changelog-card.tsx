import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ListItem } from "@/components/ui/list";
import { Changelog } from "@/types/core";
import { X } from "lucide-react";
import { useState } from "react";
import { Link } from "react-router";
const LAST_HIDDEN_VERSION_KEY = "changelog-last-hidden-version";
export function ChangelogCard(changelog: Changelog) {
  const [isShown, setIsShown] = useState(
    changelog.version !== localStorage.getItem(LAST_HIDDEN_VERSION_KEY)
  );
  const onHide = () => {
    localStorage.setItem(LAST_HIDDEN_VERSION_KEY, changelog.version);
    setIsShown(false);
  };
  if (!isShown) return null;
  return (
    <div
      className="flex flex-col gap-2 items-center size-full"
      style={{
        gridColumn: `span 1`,
        gridRow: `span 1`,
      }}
    >
      <Card className="bg-linear-to-tl from-brand/10 border-brand/15 to-transparent size-full p-4 pt-3 gap-4">
        <div className="flex flex-col gap-2 flex-1">
          <div className="flex justify-between flex-row items-center">
            <div className="flex gap-2 items-center">
              <h2 className="text-lg font-medium">Changelog</h2>
              <Badge variant="secondary" size="sm">
                Version {changelog.version}
              </Badge>
            </div>
            <Button
              size="smallIcon"
              className="-mr-1"
              variant="ghost"
              onClick={onHide}
            >
              <X strokeWidth={2.5} />
            </Button>
          </div>

          <ul className="text-sm flex flex-col gap-1">
            {changelog.changes.map((change, index) => (
              <ListItem key={index}>{change}</ListItem>
            ))}
          </ul>
        </div>
        {changelog.action && (
          <Link to={changelog.action.url}>
            <Button className="w-full" variant="brand" size="sm">
              {changelog.action.label}
            </Button>
          </Link>
        )}
      </Card>
      <p className="text-xs font-medium">Changelog</p>
    </div>
  );
}
