import {Comparer, Formatter} from "./types";
import {UserProxy} from "./models";

export const userFormatter: Formatter<UserProxy> = (user) => {
  return user?.displayName || "-";
};

export const typeFormatter: Formatter<string[]> = (type) => {
  return type ? type.sort().join(", ") : "-";
};

export const stringFormatter: Formatter<string> = (value) => {
  return value || "-";
};

export const userComparer: Comparer<UserProxy> = (a, b) => {
  return a && b ? a.uid === b.uid : !(a || b);
};

export const typeComparer: Comparer<string[]> = (a, b) => {
  return a && b ? typeFormatter(a) === typeFormatter(b) : !(a || b);
};

export const stringComparer: Comparer<string> = (a, b) => {
  return a && b ? a === b : !(a || b);
};
