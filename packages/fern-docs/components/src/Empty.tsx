import { ReactElement } from "react";

type EmptyProps = {
  name: string;
  description: string;
};

export const Empty = ({ name, description }: EmptyProps): ReactElement => {
  return (
    <div className="flex flex-col items-center text-sm">
      <div className="text-(color:--accent-a11)">{name}</div>
      <div className="text-(color:--grayscale-a10)">{description}</div>
    </div>
  );
};
