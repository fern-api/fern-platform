"use client";

import { useEffect } from "react";

import { create } from "zustand";

import { FdrAPI } from "@fern-api/fdr-sdk";

import { getMyDocsSites } from "@/app/actions/getMyDocsSites";

import { Loadable, mapLoadable } from "./Loadable";
import { getDocsSiteUrl } from "./getDocsSiteUrl";

type DocsSitesStore = {
  docsSites: Loadable<FdrAPI.dashboard.DocsSite[]>;
  setDocsSites: (docSites: FdrAPI.dashboard.DocsSite[]) => void;
};

export const useDocsSitesStore = create<DocsSitesStore>((set) => ({
  docsSites: { type: "notStartedLoading" },
  setDocsSites: (docSites: FdrAPI.dashboard.DocsSite[]) =>
    set({ docsSites: { type: "loaded", value: docSites } }),
}));

export function useMyDocsSites() {
  const docsSites = useDocsSitesStore((state) => state.docsSites);
  const setDocsSites = useDocsSitesStore((state) => state.setDocsSites);

  useEffect(() => {
    async function run() {
      if (docsSites.type === "notStartedLoading") {
        const response = await getMyDocsSites();
        setDocsSites(response.docsSites);
      }
    }

    void run();
  }, []);

  return docsSites;
}

export function useDocsSite(
  docsUrl: string
): Loadable<FdrAPI.dashboard.DocsSite | undefined> {
  const maybeLoadedDocsSites = useMyDocsSites();

  return mapLoadable(maybeLoadedDocsSites, (docsSites) =>
    docsSites.find((docsSite) => getDocsSiteUrl(docsSite) === docsUrl)
  );
}
