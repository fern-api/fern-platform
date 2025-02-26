import { ReactElement } from "react";

import { Edit } from "lucide-react";

import { ButtonLink } from "../components/FernLinkButton";

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
    <ButtonLink href={props.editThisPageUrl} variant="outline" size="sm">
      <Edit />
      {EDIT_THIS_PAGE_TEXT}
    </ButtonLink>
  );
}
