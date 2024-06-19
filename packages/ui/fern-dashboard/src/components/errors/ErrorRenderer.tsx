import { toast } from "@fern-ui/components";
import { ErrorComponentProps, Navigate } from "@tanstack/react-router";

export const ErrorRenderer: React.FC<ErrorComponentProps> = (props) => {
    toast.error(props.error.message);
    return <Navigate to="/login" search={{ error: "catch_boundary", redirect: false }} />;
};
