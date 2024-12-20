import { PropsWithChildren, ReactNode, createContext, useContext, useMemo } from "react";

export interface UserInfo {
    email?: string;
    name?: string;
}

const UserInfoContext = createContext<UserInfo>({});

export function UserInfoProvider({ children, email, name }: PropsWithChildren<UserInfo>): ReactNode {
    return (
        <UserInfoContext.Provider value={useMemo(() => ({ email, name }), [email, name])}>
            {children}
        </UserInfoContext.Provider>
    );
}

export function useUserInfo(): UserInfo {
    return useContext(UserInfoContext);
}
