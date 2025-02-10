import { ReactElement } from "react";

import { Edit } from "iconoir-react";

import { FernLinkButton } from "../components/FernLinkButton";

const EDIT_THIS_PAGE_TEXT = "Edit this page";

interface EditThisPageButton {
  editThisPageUrl: string | undefined;
}
export function EditThisPageButton(
  props: EditThisPageButton
): ReactElement<any> | null {
  if (typeof props.editThisPageUrl !== "string") {
    return null;
  }
  return (
    <FernLinkButton
      href={props.editThisPageUrl}
      icon={<Edit />}
      text={EDIT_THIS_PAGE_TEXT}
      variant="outlined"
    />
  );
}
