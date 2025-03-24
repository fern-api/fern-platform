"use client";

import { useEffect } from "react";

import { create } from "zustand";

import { ListDocsSitesForOrgResponse } from "@fern-platform/fdr";

import { getMyDocsSites } from "@/app/actions/getMyDocsSites";

import { Loadable } from "./Loadable";

type DocsSitesStore = {
  docsSites: Loadable<ListDocsSitesForOrgResponse>;
  setDocsSites: (docSites: ListDocsSitesForOrgResponse) => void;
};

export const useDocsSitesStore = create<DocsSitesStore>((set) => ({
  docsSites: { type: "notStartedLoading" },
  setDocsSites: (docSites: ListDocsSitesForOrgResponse) =>
    set({ docsSites: { type: "loaded", value: docSites } }),
}));

export function useMyDocsSites() {
  const docsSites = useDocsSitesStore((state) => state.docsSites);
  const setDocsSites = useDocsSitesStore((state) => state.setDocsSites);

  useEffect(() => {
    async function run() {
      if (docsSites.type === "notStartedLoading") {
        setDocsSites(await getMyDocsSites());
      }
    }

    void run();
  }, []);

  if (docsSites.type === "loaded") {
    return { docsSites: docsSites.value.docsSites };
  } else {
    return { docsSites: undefined };
  }
}

export async function getOrLoadMyDocsSites() {
  const { docsSites } = useDocsSitesStore.getState();
  if (docsSites.type === "loaded") {
    return docsSites.value;
  }
  return await getMyDocsSites();
}
