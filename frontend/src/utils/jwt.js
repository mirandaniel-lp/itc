export function decodeJwt(token) {
  const p = token.split(".")[1];
  const s = p.replace(/-/g, "+").replace(/_/g, "/");
  const json = decodeURIComponent(
    atob(s)
      .split("")
      .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
      .join("")
  );
  return JSON.parse(json);
}
