import { Button, InputGroup, InputGroupProps } from "@blueprintjs/core";
import { useBooleanState } from "@fern-ui/react-commons";
import { EyeOpenIcon, LockClosedIcon } from "@radix-ui/react-icons";
import { FC } from "react";

export const PasswordInputGroup: FC<InputGroupProps> = (props) => {
    const showPassword = useBooleanState(false);
    return (
        <InputGroup
            leftIcon={<LockClosedIcon />}
            {...props}
            type={showPassword.value ? "text" : "password"}
            rightElement={
                props.value != null && props.value.length > 0 ? (
                    <Button
                        minimal={true}
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
