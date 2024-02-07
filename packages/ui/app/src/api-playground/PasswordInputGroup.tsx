import { useBooleanState } from "@fern-ui/react-commons";
import { EyeOpenIcon, LockClosedIcon } from "@radix-ui/react-icons";
import { FC } from "react";
import { FernButton } from "../components/FernButton";
import { FernInput, FernInputProps } from "../components/FernInput";

export const PasswordInputGroup: FC<FernInputProps> = ({ ref, ...props }) => {
    const showPassword = useBooleanState(false);
    return (
        <FernInput
            leftIcon={<LockClosedIcon />}
            {...props}
            type={showPassword.value ? "text" : "password"}
            rightElement={
                props.value != null && props.value.length > 0 ? (
                    <FernButton
                        buttonStyle="minimal"
                        icon={<EyeOpenIcon />}
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
