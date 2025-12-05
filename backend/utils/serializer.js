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
        const d = new Date(value);
        const parts = new Intl.DateTimeFormat("es-BO", {
          timeZone: "America/La_Paz",
          year: "numeric",
          month: "2-digit",
          day: "2-digit",
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
          hour12: false,
        }).formatToParts(d);
        const map = {};
        parts.forEach((p) => (map[p.type] = p.value));
        newObj[
          key
        ] = `${map.year}-${map.month}-${map.day} ${map.hour}:${map.minute}:${map.second}`;
      } else {
        newObj[key] = serialize(value);
      }
    }
    return newObj;
  }
  return obj;
};
