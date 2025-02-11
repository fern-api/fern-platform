"use client";

import { atom } from "jotai";
import { useHydrateAtoms } from "jotai/utils";

export const isFileForgeHackEnabledAtom = atom(false);
export const isProxyDisabledAtom = atom(false);
export const hasVoiceIdPlaygroundFormAtom = atom(false);
export const usesApplicationJsonInFormDataValueAtom = atom(false);
export const isBinaryOctetStreamAudioPlayerAtom = atom(false);

export function ApiExplorerFlags({
  isFileForgeHackEnabled,
  isProxyDisabled,
  hasVoiceIdPlaygroundForm,
  usesApplicationJsonInFormDataValue,
  isBinaryOctetStreamAudioPlayer,
}: {
  isFileForgeHackEnabled: boolean;
  isProxyDisabled: boolean;
  hasVoiceIdPlaygroundForm: boolean;
  usesApplicationJsonInFormDataValue: boolean;
  isBinaryOctetStreamAudioPlayer: boolean;
}) {
  useHydrateAtoms([
    [isFileForgeHackEnabledAtom, isFileForgeHackEnabled],
    [isProxyDisabledAtom, isProxyDisabled],
    [hasVoiceIdPlaygroundFormAtom, hasVoiceIdPlaygroundForm],
    [
      usesApplicationJsonInFormDataValueAtom,
      usesApplicationJsonInFormDataValue,
    ],
    [isBinaryOctetStreamAudioPlayerAtom, isBinaryOctetStreamAudioPlayer],
  ]);
  return null;
}
