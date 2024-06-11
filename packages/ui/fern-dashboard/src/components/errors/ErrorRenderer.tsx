import { ErrorComponentProps } from "@tanstack/react-router";

export const ErrorRenderer: React.FC<ErrorComponentProps> = (props) => {
    return (
        <div>
            {props.error.name}
            {props.error.message}
        </div>
    );
};
