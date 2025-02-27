import NextTopLoader from "nextjs-toploader";
import resolveConfig from "tailwindcss/resolveConfig";
import tailwindConfig from "../../tailwind.config";

const fullConfig = resolveConfig(tailwindConfig);
const colors = fullConfig.theme?.colors;
const primaryColor = colors?.blue[500];
export function TopLoader() {
  return (
    <NextTopLoader shadow={false} color={primaryColor} showSpinner={false} />
  );
}
