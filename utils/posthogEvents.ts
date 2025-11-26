import posthog from "posthog-js";

const isBrowser = () => typeof window !== "undefined";

export const capturePH = (event: string, properties?: Record<string, any>) => {
  if (!isBrowser()) return;
  try {
    posthog.capture(event, properties);
  } catch (error) {
    console.error("posthog.capture failed", error);
  }
};

export const identifyPH = (distinctId: string, properties?: Record<string, any>) => {
  if (!isBrowser()) return;
  try {
    posthog.identify(distinctId, properties);
  } catch (error) {
    console.error("posthog.identify failed", error);
  }
};

export const pageViewPH = (path: string) => capturePH("$pageview", { path });
