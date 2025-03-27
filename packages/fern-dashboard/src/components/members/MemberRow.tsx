import { GetMembers200ResponseOneOfInner } from "auth0";

export declare namespace MemberRow {
  export interface Props {
    member: GetMembers200ResponseOneOfInner;
  }
}

export function MemberRow({ member }: MemberRow.Props) {
  return <div className="flex">{JSON.stringify(member)}</div>;
}
