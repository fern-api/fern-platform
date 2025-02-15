import { ReactElement } from "react";

type EmptyProps = {
  name: string;
  description: string;
};

export const Empty = ({ name, description }: EmptyProps): ReactElement => {
  return (
    <div className="flex flex-col items-center">
      <div className="text-accent"> {name} </div>
      <div className="text-muted"> {description} </div>
    </div>
  );
};
