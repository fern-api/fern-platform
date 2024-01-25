import { signOut, useSession } from "next-auth/react";
import { FC } from "react";

export const User: FC = () => {
    const { data: session } = useSession();

    if (session == null) {
        return null;
    }

    return (
        <div>
            {session.user?.name} (<a onClick={() => signOut()}>{"logout"}</a>)
        </div>
    );
};
