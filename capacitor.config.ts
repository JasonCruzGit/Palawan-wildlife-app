import type { CapacitorConfig } from "@capacitor/cli";

/**
 * The APK is a native shell around the Next.js app.
 * Photo ID and APIs need the Next server reachable from the phone.
 *
 * Local Wi‑Fi (default): run `npm run dev:mobile` on your Mac, same network.
 * Production: set CAPACITOR_SERVER_URL to your https:// deployment and rebuild.
 */
const serverUrl =
  process.env.CAPACITOR_SERVER_URL ?? "http://192.168.86.44:3000";

const config: CapacitorConfig = {
  appId: "ph.palawan.wildlife",
  appName: "Palawan Wildlife",
  webDir: "www",
  server: {
    url: serverUrl,
    cleartext: serverUrl.startsWith("http://"),
  },
  android: {
    allowMixedContent: true,
  },
  plugins: {
    SplashScreen: {
      launchAutoHide: true,
    },
  },
};

export default config;
