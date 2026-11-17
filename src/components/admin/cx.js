import styles from "./admin.module.css";

export const cx = (...names) =>
  names
    .filter(Boolean)
    .join(" ")
    .split(" ")
    .map((name) => styles[name])
    .filter(Boolean)
    .join(" ");
