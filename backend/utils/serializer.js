export const serialize = (obj) => {
  if (Array.isArray(obj)) {
    return obj.map(serialize);
  } else if (obj && typeof obj === "object") {
    const newObj = {};
    for (const key in obj) {
      const value = obj[key];
      if (typeof value === "bigint") {
        newObj[key] = value.toString();
      } else if (value instanceof Date) {
        newObj[key] = value.toISOString();
      } else {
        newObj[key] = serialize(value);
      }
    }
    return newObj;
  }
  return obj;
};
