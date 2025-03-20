import { atom, useAtom, useSetAtom } from "jotai";

export const isDismissableSidebarOpenAtom = atom(false);

export const useIsDismissableSidebarOpen = () => {
  return useAtom(isDismissableSidebarOpenAtom);
};

export const useToggleDismissableSidebar = () => {
  const setIsDismissableSidebarOpen = useSetAtom(isDismissableSidebarOpenAtom);
  return () => setIsDismissableSidebarOpen((prev) => !prev);
};

export const useCloseDismissableSidebar = () => {
  const setIsDismissableSidebarOpen = useSetAtom(isDismissableSidebarOpenAtom);
  return () => setIsDismissableSidebarOpen(false);
};
