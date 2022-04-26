export const isNumber = (value: unknown) => typeof value === "number";
export const isString = (value: unknown) =>
  typeof value === "string" || value instanceof String;
