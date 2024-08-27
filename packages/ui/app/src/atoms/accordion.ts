import { atom, useAtom, useAtomValue } from "jotai";

export const ACCORDION_FREQUENCY_MAP = atom<Record<string, number>>({});

export function useAccordionFrequencyMap(): Record<string, number> {
    return useAtomValue(ACCORDION_FREQUENCY_MAP);
}

export function useUpdateAccordionFrequencyMap(): (key: string) => number {
    const [_counter, setCounter] = useAtom(ACCORDION_FREQUENCY_MAP);

    return (key: string) => {
        let count = 0;
        setCounter((prevCounter: Record<string, number>) => {
            count = (prevCounter[key] ?? 0) + 1;
            return {
                ...prevCounter,
                [key]: count,
            };
        });

        return count;
    };
}
