import { parseValidDate } from "../validators/valueValidators.js";

export function toDate(value) {
  return parseValidDate(value);
}

export function isValidDate(value) {
  return Boolean(toDate(value));
}
