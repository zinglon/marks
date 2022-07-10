import { isFirefox } from "../utils/detectPlatform";

export const createPlatformService = () => {
  const hasReaderMode = async () => await isFirefox();
  const getFeatures = async () => ({
    hasReaderMode: await hasReaderMode(),
  });

  return { getFeatures };
};

export const platformService = createPlatformService();
export type PlatformService = typeof platformService;
