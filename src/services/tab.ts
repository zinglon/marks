import { TabData, tabData } from "../data/tab";

export const createTabService = (tabData: TabData) => {
  const openTab = async (url: string, openInReaderMode?: boolean) => {
    await tabData.createTab(url, openInReaderMode);
    await tabData.closeCurrentTab();
  };
  return { openTab };
};

export const tabService = createTabService(tabData);
export type TabService = typeof tabService;

if (import.meta.vitest) {
  const { describe, expect, it, vi } = import.meta.vitest;
  describe("createTabService", () => {
    describe("openTab", () => {
      it("creates a tab and closes the current", async () => {
        const url = "https://example.com";
        const openInReaderMode = true;
        const tabData: TabData = {
          closeCurrentTab: vi.fn().mockReturnValue(Promise.resolve()),
          createTab: vi.fn().mockReturnValue(Promise.resolve()),
        };
        const tabService = createTabService(tabData);
        await tabService.openTab(url, openInReaderMode);
        expect(tabData.createTab).toHaveBeenCalledWith(url, openInReaderMode);
        expect(tabData.closeCurrentTab).toHaveBeenCalled();
      });
    });
  });
}
