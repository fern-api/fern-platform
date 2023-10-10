import { ApiWrapper } from "./ApiWrapper";

interface Props {
    className?: string;
}

export default function ApiRequest({ className }: Props): JSX.Element {
    return <ApiWrapper>Request</ApiWrapper>;
}
