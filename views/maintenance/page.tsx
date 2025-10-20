import { AppleEmoji } from "@/components/misc/apple-emoji";
import { TitleManager } from "@/components/misc/title-manager";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { QueryWrapper } from "@/components/ui/query-wrapper";
import { WEBSITE_TITLE } from "@/constants/website";
import { useQuery } from "@tanstack/react-query";

import {
  Megaphone03StrokeRounded,
  RefreshIcon,
} from "@hugeicons-pro/core-stroke-rounded";
import { HugeiconsIcon } from "@hugeicons/react";
import { useEffect } from "react";
import { useNavigate } from "react-router";
import { getTRPCQueryOptions, trpc } from "../trpc";

export default function MaintenancePage() {
  const navigate = useNavigate();
  const healthCheck = useQuery(getTRPCQueryOptions(trpc.myed.health)());
  useEffect(() => {
    if (healthCheck.data?.isHealthy) {
      navigate("/");
    }
  }, [healthCheck.data]);

  return (
    <>
      <TitleManager>Maintenance</TitleManager>
      <div className="flex flex-col items-center justify-center min-h-dvh w-full max-w-[600px] mx-auto gap-6 p-4">
        {/* Header Section */}
        <div className="flex flex-col items-center gap-4 text-center">
          <AppleEmoji
            imageClassName="size-[50px]"
            textClassName="text-5xl"
            value="🚧"
          />

          <div className="space-y-2">
            <h1 className="text-2xl font-semibold">Maintenance in Progress</h1>
            <p className="text-muted-foreground max-w-[450px]">
              {WEBSITE_TITLE} is currently unavailable because MyEducationBC is
              undergoing maintenance. We'll be back as soon as their service is
              restored.
            </p>
          </div>
        </div>
        <QueryWrapper query={healthCheck}>
          {(data) =>
            data.message && (
              <Card className="w-full border-l-4 border-l-brand bg-linear-to-r from-brand/5 to-transparent">
                <CardHeader className="pb-3">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-full bg-brand/10">
                      <HugeiconsIcon
                        icon={Megaphone03StrokeRounded}
                        className="size-4 text-brand"
                      />
                    </div>
                    <div className="flex flex-col">
                      <h3 className="font-medium text-sm">Official Update</h3>
                      <p className="text-xs text-brand">
                        Message from MyEducationBC
                      </p>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  <p className="text-sm leading-relaxed text-foreground">
                    {data.message}
                  </p>
                </CardContent>
              </Card>
            )
          }
        </QueryWrapper>

        {/* Action Section */}
        <div className="flex flex-col items-center gap-4 w-full">
          <Button
            onClick={async () => {
              await healthCheck.refetch();
            }}
            variant="outline"
            shouldShowChildrenOnLoading
            className="w-full max-w-[200px]"
            leftIcon={<HugeiconsIcon icon={RefreshIcon} className="size-4" />}
          >
            Check Again
          </Button>

          <p className="text-xs text-muted-foreground text-center">
            Thank you for your patience. You can refresh this page to see if
            maintenance is complete.
          </p>
        </div>
      </div>
    </>
  );
}
