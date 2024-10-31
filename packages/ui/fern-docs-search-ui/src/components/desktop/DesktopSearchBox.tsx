"use client";

import * as VisuallyHidden from "@radix-ui/react-visually-hidden";
import type { MutableRefObject, ReactElement } from "react";
import { useEffect } from "react";
import { useSearchBox } from "react-instantsearch";

export type SearchBoxTranslations = Partial<{
    searchInputLabel: string;
}>;

interface DesktopSearchBoxProps {
    autoFocus: boolean;
    inputRef: MutableRefObject<HTMLInputElement | null>;
    inputClassName: string;
    placeholder: string;
    isFromSelection: boolean;
    translations?: SearchBoxTranslations;
    disabled?: boolean;
}

export function DesktopSearchBox({ translations = {}, disabled, ...props }: DesktopSearchBoxProps): ReactElement {
    const { searchInputLabel = "Search" } = translations;

    const { query, refine } = useSearchBox();

    useEffect(() => {
        if (props.autoFocus && props.inputRef.current) {
            props.inputRef.current.focus();
        }
    }, [props.autoFocus, props.inputRef]);

    useEffect(() => {
        if (props.isFromSelection && props.inputRef.current) {
            props.inputRef.current.select();
        }
    }, [props.isFromSelection, props.inputRef]);

    return (
        <>
            <VisuallyHidden.Root>
                <label>{searchInputLabel}</label>
            </VisuallyHidden.Root>
            <input
                type="search"
                className={props.inputClassName}
                ref={props.inputRef}
                autoFocus={props.autoFocus}
                disabled={disabled}
                autoComplete="off"
                autoCorrect="off"
                autoCapitalize="off"
                spellCheck={false}
                placeholder={props.placeholder}
                maxLength={128}
                value={query}
                onChange={(e) => {
                    refine(e.target.value);
                }}
            />
        </>
    );
}
