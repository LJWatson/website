// A rough "Browser on device" label for the Account page. The full user agent isn't stored.
const BROWSERS = [
  [/Edg(A|iOS)?\//, "Edge"],
  [/Firefox\/|FxiOS\//, "Firefox"],
  [/SamsungBrowser\//, "Samsung Internet"],
  [/Chrome\/|CriOS\//, "Chrome"],
  [/Safari\//, "Safari"]
];

const SYSTEMS = [
  [/iPad/, "iPad"],
  [/iPhone|iPod/, "iPhone"],
  [/Android/, "Android"],
  [/Windows/, "Windows"],
  [/Macintosh|Mac OS X/, "Mac"],
  [/CrOS/, "ChromeOS"],
  [/Linux/, "Linux"]
];

export function summariseUserAgent(userAgent) {
  const value = String(userAgent || "");
  const browser = BROWSERS.find(([pattern]) => pattern.test(value));
  const system = SYSTEMS.find(([pattern]) => pattern.test(value));

  if (!browser && !system) {
    return "Unknown browser";
  }

  return `${browser ? browser[1] : "Unknown browser"} on ${system ? system[1] : "an unknown device"}`;
}
