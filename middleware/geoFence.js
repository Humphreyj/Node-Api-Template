import geoip from "geoip-lite";

export const geoFence = (req, res, next) => {
  const ip = req.headers["x-forwarded-for"] || req.connection.remoteAddress;
  const geo = geoip.lookup(ip);

  if (ip === "::ffff:127.0.0.1") {
    return res.status(200).send("Local");
  }

  if (geo && geo.country !== "US") {
    return res.status(403).send("This app is not available in your region.");
  }

  next();
};
