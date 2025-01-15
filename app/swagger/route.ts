import { readFileSync } from "fs";
import yaml from "js-yaml";
import { NextResponse } from "next/server";
import { join } from "path";

export async function GET() {
  // Only allow in development
  if (process.env.NODE_ENV !== "development") {
    return new NextResponse("Not found", { status: 404 });
  }

  try {
    // Read OpenAPI spec file
    const specPath = join(process.cwd(), "app/swagger/myed-rest.yaml");
    const specYaml = readFileSync(specPath, "utf8");
    const spec = yaml.load(specYaml);

    // Generate Swagger UI HTML
    const html = `
      <!DOCTYPE html>
      <html lang="en">
        <head>
          <meta charset="utf-8" />
          <meta name="viewport" content="width=device-width, initial-scale=1" />
          <title>MyEd REST API Documentation</title>
          <link rel="stylesheet" href="https://unpkg.com/swagger-ui-dist@5.9.0/swagger-ui.css" />
        </head>
        <body>
          <div id="swagger-ui"></div>
          <script src="https://unpkg.com/swagger-ui-dist@5.9.0/swagger-ui-bundle.js"></script>
          <script>
            window.onload = () => {
              window.ui = SwaggerUIBundle({
                spec: ${JSON.stringify(spec)},
                dom_id: '#swagger-ui',
                deepLinking: true,
                presets: [
                  SwaggerUIBundle.presets.apis,
                  SwaggerUIBundle.SwaggerUIStandalonePreset
                ],
              });
            };
          </script>
        </body>
      </html>
    `;

    return new NextResponse(html, {
      headers: {
        "Content-Type": "text/html",
      },
    });
  } catch (error) {
    console.error("Error generating Swagger UI:", error);
    return new NextResponse("Error generating API documentation", {
      status: 500,
    });
  }
}
