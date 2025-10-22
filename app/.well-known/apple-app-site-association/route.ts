const appID = `${process.env.APPLE_TEAM_ID}.${process.env.IOS_APP_BUNDLE_ID}`;
export async function GET() {
  return new Response(
    JSON.stringify({
      applinks: {
        apps: [],
        details: [
          {
            appID,
            paths: ["*"],
          },
        ],
      },
      webcredentials: {
        apps: [appID],
      },
    }),
    {
      headers: {
        "Content-Type": "application/json",
      },
    }
  );
}
