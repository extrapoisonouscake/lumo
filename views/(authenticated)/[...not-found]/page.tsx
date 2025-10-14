import { PageHeading } from "@/components/layout/page-heading";
import { TitleManager } from "@/components/misc/title-manager";
import { Button } from "@/components/ui/button";
import { clientAuthChecks } from "@/helpers/client-auth-checks";
import UnauthenticatedLayout from "@/views/(unauthenticated)/layout";

import {
  ArrowLeft01StrokeRounded,
  FastWindStrokeRounded,
  Home03StrokeRounded,
} from "@hugeicons-pro/core-stroke-rounded";
import { HugeiconsIcon } from "@hugeicons/react";
import { Link } from "react-router";
import AuthenticatedLayout from "../layout";

export default function NotFoundPage() {
  const isLoggedIn = clientAuthChecks.isLoggedIn();
  const Layout = isLoggedIn ? AuthenticatedLayout : UnauthenticatedLayout;
  return (
    <Layout>
      <TitleManager>Page Not Found</TitleManager>
      <PageHeading shouldShowBackButton={false} />
      <div className="mx-auto max-w-2xl">
        <div className="p-4 w-full max-w-md flex flex-col gap-4 text-center">
          <div className="flex flex-col gap-3">
            <div className="mx-auto size-16 bg-brand/20 rounded-full flex items-center justify-center">
              <HugeiconsIcon
                icon={FastWindStrokeRounded}
                className="size-7 text-brand"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <h2 className="text-2xl font-semibold">Page Not Found</h2>
              <p className="text-base text-muted-foreground">
                The page you're looking for doesn't exist or has been moved.
                Let's get you back on track!
              </p>
            </div>
          </div>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link to="/" className="flex-1">
              <Button className="w-full" size="lg" variant="brand">
                <HugeiconsIcon icon={Home03StrokeRounded} className="size-4" />
                Go Home
              </Button>
            </Link>

            {isLoggedIn && (
              <Button
                variant="outline"
                size="lg"
                onClick={() => window.history.back()}
              >
                <HugeiconsIcon
                  icon={ArrowLeft01StrokeRounded}
                  className="size-4"
                />
                Go Back
              </Button>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
}
