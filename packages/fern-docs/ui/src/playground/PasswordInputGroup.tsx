import { FernButton, FernInput, FernInputProps } from "@fern-docs/components";
import { useBooleanState } from "@fern-ui/react-commons";
import { Eye, Lock } from "iconoir-react";
import { forwardRef } from "react";

export const PasswordInputGroup = forwardRef<HTMLInputElement, FernInputProps>(
  (props, forwardedRef) => {
    const showPassword = useBooleanState(false);
    return (
      <FernInput
        ref={forwardedRef}
        leftIcon={<Lock className="size-icon" />}
        {...props}
        type={showPassword.value ? "text" : "password"}
        rightElement={
          typeof props.value === "string" && props.value.length > 0 ? (
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
  }
);

PasswordInputGroup.displayName = "PasswordInputGroup";
