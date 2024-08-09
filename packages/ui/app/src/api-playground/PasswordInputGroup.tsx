import { FernButton, FernInput, FernInputProps } from "@fern-ui/components";
import { Eye, EyeDashed, LockClosed } from "@fern-ui/icons";
import { useBooleanState } from "@fern-ui/react-commons";
import { FC } from "react";

export const PasswordInputGroup: FC<FernInputProps> = ({ ref, ...props }) => {
    const showPassword = useBooleanState(false);
    return (
        <FernInput
            leftIcon={<LockClosed className="size-icon" />}
            {...props}
            type={showPassword.value ? "text" : "password"}
            rightElement={
                props.value != null && props.value.length > 0 ? (
                    <FernButton
                        variant="minimal"
                        icon={showPassword.value ? <Eye /> : <EyeDashed />}
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
