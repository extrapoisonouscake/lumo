import dayjs from "dayjs";
import customParseFormat from "dayjs/plugin/customParseFormat";
import isBetween from "dayjs/plugin/isBetween";
export default dayjs;
dayjs.extend(customParseFormat);
dayjs.extend(isBetween);
