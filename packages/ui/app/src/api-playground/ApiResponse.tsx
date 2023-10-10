import { ApiWrapper } from "./ApiWrapper";

interface Props {
    className?: string;
}

export default function ApiResponse({ className }: Props): JSX.Element {
    return <ApiWrapper>Response</ApiWrapper>;
}
