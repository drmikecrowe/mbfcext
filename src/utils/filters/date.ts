import get from "lodash/get";

export default value => {
  const date = new Date(value);
  const locale = get(window, "navigator.userLanguage", get(window, "navigator.language"));
  return date.toLocaleDateString(locale, {
    month: "short",
    day: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit"
  }); //if you want, you can change locale date string
};
