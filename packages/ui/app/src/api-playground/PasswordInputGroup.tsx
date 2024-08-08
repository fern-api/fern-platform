import { FernButton, FernInput, FernInputProps } from "@fern-ui/components";
import { useBooleanState } from "@fern-ui/react-commons";
import { Eye, Lock } from "iconoir-react";
import { FC } from "react";

export const PasswordInputGroup: FC<FernInputProps> = ({ ref, ...props }) => {
    const showPassword = useBooleanState(false);
    return (
        <FernInput
            leftIcon={<Lock className="size-4" />}
            {...props}
            type={showPassword.value ? "text" : "password"}
            rightElement={
                props.value != null && props.value.length > 0 ? (
                    <FernButton
                        variant="minimal"
                        icon={<Eye />}
                        onMouseDown={showPassword.setTrue}
                        onMouseUp={showPassword.setFalse}
                        onMouseOut={showPassword.setFalse}
                    />
                ) : (
                    props.rightElement
                )
            }
        />
    );
};
