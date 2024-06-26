import { ReactElement, ReactNode } from "react";

interface CustomLayoutProps {
    children: ReactNode;
}

export function CustomLayout({ children }: CustomLayoutProps): ReactElement {
    return (
        <article className="mx-auto w-full break-words lg:ml-0 xl:mx-auto pb-20 max-w-content-width">
            {children}
        </article>
    );
}
