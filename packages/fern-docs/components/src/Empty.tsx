import { ReactElement } from "react";

type EmptyProps = {
  name: string;
  description: string;
};

export const Empty = ({ name, description }: EmptyProps): ReactElement => {
  return (
    <div className="flex flex-col items-center">
      <div className="t-accent"> {name} </div>
      <div className="t-muted"> {description} </div>
    </div>
  );
};
