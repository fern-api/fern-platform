import { Button, InputGroup, InputGroupProps } from "@blueprintjs/core";
import { EyeOpen, Key } from "@blueprintjs/icons";
import { useBooleanState } from "@fern-ui/react-commons";
import { FC } from "react";

export const PasswordInputGroup: FC<InputGroupProps> = (props) => {
    const showPassword = useBooleanState(false);
    return (
        <InputGroup
            leftIcon={<Key />}
            {...props}
            type={showPassword.value ? "text" : "password"}
            rightElement={
                props.value != null && props.value.length > 0 ? (
                    <Button
                        minimal={true}
                        icon={<EyeOpen />}
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
