import { ReactElement } from "react";
import { FernLinkButton } from "../components/FernLinkButton";

const EDIT_THIS_PAGE_TEXT = "Edit this page";
const EDIT_THIS_PAGE_ICON = "duotone pen-to-square";

interface EditThisPageButton {
    editThisPageUrl: string | undefined;
}
export function EditThisPageButton(props: EditThisPageButton): ReactElement | null {
    if (props.editThisPageUrl == null) {
        return null;
    }
    return (
        <FernLinkButton
            href={props.editThisPageUrl}
            icon={EDIT_THIS_PAGE_ICON}
            text={EDIT_THIS_PAGE_TEXT}
            variant="outlined"
        />
    );
}
