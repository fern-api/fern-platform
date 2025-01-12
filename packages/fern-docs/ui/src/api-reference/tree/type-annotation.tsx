import * as ApiDefinition from "@fern-api/fdr-sdk/api-definition";
import { cn } from "@fern-docs/components";
import { capitalize } from "es-toolkit/string";
import { ComponentPropsWithoutRef, forwardRef, memo } from "react";
import { useTypeShorthandLang } from "../../atoms";
import { renderTypeShorthand } from "../../type-shorthand";
import { useTypeDefinitions } from "./contexts";

interface TypeAnnotationProps extends ComponentPropsWithoutRef<"span"> {
  shape: ApiDefinition.TypeShapeOrReference;
  isOptional?: boolean;
}

export const TypeAnnotation = memo(
  forwardRef<HTMLSpanElement, TypeAnnotationProps>(
    function TypeAnnotation(props, ref) {
      const lang = useTypeShorthandLang();

      const getComponent = () => {
        switch (lang) {
          case "ts":
            return TypeAnnotationTypescript;
          case "py":
            return TypeAnnotationPython;
          case "go":
            return TypeAnnotationGo;
          case "java":
            return TypeAnnotationJava;
          case "cs":
            return TypeAnnotationCSharp;
          case "rb":
            return TypeAnnotationRuby;
          default:
            return TypeAnnotationDefault;
        }
      };
      const Component = getComponent();
      return <Component ref={ref} {...props} />;
    }
  )
);

const TypeAnnotationTypescript = forwardRef<
  HTMLSpanElement,
  TypeAnnotationProps
>(function TypeAnnotationTypescript({ shape, isOptional, ...props }, ref) {
  const types = useTypeDefinitions();

  function toString(shape: ApiDefinition.TypeShapeOrReference): string {
    const unwrapped = ApiDefinition.unwrapReference(shape, types);

    switch (unwrapped.shape.type) {
      case "primitive": {
        switch (unwrapped.shape.value.type) {
          case "string":
          case "uuid":
          case "base64":
            return "string";
          case "date":
          case "datetime":
            return "Date";
          case "bigInteger":
            return "bigint";
          case "integer":
          case "uint":
          case "uint64":
          case "long":
            return "number";
          case "double":
            return "float";
          case "boolean":
            return "boolean";
          default:
            return "unknown";
        }
      }
      case "object":
        return "object";
      case "literal":
        return unwrapped.shape.value.type === "stringLiteral"
          ? `"${unwrapped.shape.value.value}"`
          : String(unwrapped.shape.value.value);
      case "list": {
        const str = toString(unwrapped.shape.itemShape);
        return str.includes(" ") ? `Array<${str}>` : `${str}[]`;
      }
      case "set":
        return `Set<${toString(unwrapped.shape.itemShape)}>`;
      case "map":
        return `Record<${toString(unwrapped.shape.keyShape)}, ${toString(unwrapped.shape.valueShape)}>`;
      case "enum":
        return (
          unwrapped.shape.values
            .slice(0, 3)
            .map((value) => `"${value.value}"`)
            .join(" | ") + (unwrapped.shape.values.length > 3 ? " | ..." : "")
        );
      case "undiscriminatedUnion":
        return `${unwrapped.shape.variants
          .slice(0, 3)
          .map((variant) => toString(variant.shape))
          .join(" | ")}${unwrapped.shape.variants.length > 3 ? " | ..." : ""}`;
      case "discriminatedUnion":
        return "object";
      case "unknown":
      default:
        return "any";
    }
  }

  return (
    <span ref={ref} {...props} className={cn("font-mono", props.className)}>
      {`${isOptional ? "?: " : ": "}${toString(shape)}`}
    </span>
  );
});

const TypeAnnotationPython = forwardRef<HTMLSpanElement, TypeAnnotationProps>(
  function TypeAnnotationPython({ shape, isOptional, ...props }, ref) {
    const types = useTypeDefinitions();

    function toString(shape: ApiDefinition.TypeShapeOrReference): string {
      const unwrapped = ApiDefinition.unwrapReference(shape, types);
      switch (unwrapped.shape.type) {
        case "primitive": {
          switch (unwrapped.shape.value.type) {
            case "string":
              return "str";
            case "uuid":
              return "UUID";
            case "date":
              return "datetime.date";
            case "datetime":
              return "datetime.datetime";
            case "bigInteger":
            case "integer":
            case "uint":
            case "uint64":
            case "long":
              return "int";
            case "double":
              return "float";
            case "boolean":
              return "bool";
            case "base64":
              return "bytes";
            default:
              return "Any";
          }
        }
        case "object":
          return "dict";
        case "literal":
          return unwrapped.shape.value.type === "stringLiteral"
            ? `Literal["${unwrapped.shape.value.value}"]`
            : capitalize(String(unwrapped.shape.value.value));
        case "list":
          return `List[${toString(unwrapped.shape.itemShape)}]`;
        case "set":
          return `Set[${toString(unwrapped.shape.itemShape)}]`;
        case "map":
          return `Dict[${toString(unwrapped.shape.keyShape)}, ${toString(unwrapped.shape.valueShape)}]`;
        case "enum":
          return `Enum`;
        case "undiscriminatedUnion":
          return `Union[${unwrapped.shape.variants
            .slice(0, 3)
            .map((variant) => toString(variant.shape))
            .join(", ")}${unwrapped.shape.variants.length > 3 ? ", ..." : ""}]`;
        case "discriminatedUnion":
          return "Union";
        case "unknown":
        default:
          return "Any";
      }
    }

    const title = isOptional ? `Optional[${toString(shape)}]` : toString(shape);

    return (
      <span
        ref={ref}
        {...props}
        className={cn("font-mono", props.className)}
        title={title}
      >{`: ${title}`}</span>
    );
  }
);

const TypeAnnotationGo = forwardRef<HTMLSpanElement, TypeAnnotationProps>(
  function TypeAnnotationGo({ shape, isOptional, ...props }, ref) {
    const types = useTypeDefinitions();

    function toString(shape: ApiDefinition.TypeShapeOrReference): string {
      const unwrapped = ApiDefinition.unwrapReference(shape, types);
      switch (unwrapped.shape.type) {
        case "primitive": {
          switch (unwrapped.shape.value.type) {
            case "string":
            case "uuid":
            case "base64":
              return "string";
            case "date":
            case "datetime":
              return "time.Time";
            case "bigInteger":
              return "int64";
            case "integer":
            case "uint":
              return "int";
            case "uint64":
              return "uint64";
            case "long":
              return "int64";
            case "double":
              return "float64";
            case "boolean":
              return "bool";
            default:
              return "interface{}";
          }
        }
        case "object":
          return "map[string]interface{}";
        case "literal":
          return unwrapped.shape.value.type === "stringLiteral"
            ? `"${unwrapped.shape.value.value}"`
            : String(unwrapped.shape.value.value);
        case "list":
          return `[]${toString(unwrapped.shape.itemShape)}`;
        case "set":
          return `map[${toString(unwrapped.shape.itemShape)}]struct{}`;
        case "map":
          return `map[${toString(unwrapped.shape.keyShape)}]${toString(unwrapped.shape.valueShape)}`;
        case "enum":
          return `enum`;
        case "undiscriminatedUnion":
        case "discriminatedUnion":
          return "interface{}";
        case "unknown":
        default:
          return "interface{}";
      }
    }

    return (
      <span ref={ref} {...props} className={cn("font-mono", props.className)}>
        {`${isOptional ? "*" : ""}${toString(shape)}`}
      </span>
    );
  }
);

const TypeAnnotationJava = forwardRef<HTMLSpanElement, TypeAnnotationProps>(
  function TypeAnnotationJava({ shape, isOptional, ...props }, ref) {
    const types = useTypeDefinitions();

    function toString(shape: ApiDefinition.TypeShapeOrReference): string {
      const unwrapped = ApiDefinition.unwrapReference(shape, types);
      switch (unwrapped.shape.type) {
        case "primitive": {
          switch (unwrapped.shape.value.type) {
            case "string":
            case "uuid":
            case "base64":
              return "String";
            case "date":
              return "LocalDate";
            case "datetime":
              return "LocalDateTime";
            case "bigInteger":
              return "BigInteger";
            case "integer":
            case "uint":
              return "Integer";
            case "uint64":
            case "long":
              return "Long";
            case "double":
              return "Double";
            case "boolean":
              return "Boolean";
            default:
              return "Object";
          }
        }
        case "object":
          return "Map<String, Object>";
        case "literal":
          return unwrapped.shape.value.type === "stringLiteral"
            ? `"${unwrapped.shape.value.value}"`
            : String(unwrapped.shape.value.value);
        case "list":
          return `List<${toString(unwrapped.shape.itemShape)}>`;
        case "set":
          return `Set<${toString(unwrapped.shape.itemShape)}>`;
        case "map":
          return `Map<${toString(unwrapped.shape.keyShape)}, ${toString(unwrapped.shape.valueShape)}>`;
        case "enum":
          return "enum";
        case "undiscriminatedUnion":
        case "discriminatedUnion":
        case "unknown":
        default:
          return "Object";
      }
    }

    return (
      <span ref={ref} {...props} className={cn("font-mono", props.className)}>
        {`: ${toString(shape)}${isOptional ? " (Optional)" : ""}`}
      </span>
    );
  }
);

const TypeAnnotationCSharp = forwardRef<HTMLSpanElement, TypeAnnotationProps>(
  function TypeAnnotationCSharp({ shape, isOptional, ...props }, ref) {
    const types = useTypeDefinitions();

    function toString(shape: ApiDefinition.TypeShapeOrReference): string {
      const unwrapped = ApiDefinition.unwrapReference(shape, types);
      switch (unwrapped.shape.type) {
        case "primitive": {
          switch (unwrapped.shape.value.type) {
            case "string":
            case "uuid":
            case "base64":
              return "string";
            case "date":
              return "DateOnly";
            case "datetime":
              return "DateTime";
            case "bigInteger":
              return "long";
            case "integer":
            case "uint":
              return "int";
            case "uint64":
              return "ulong";
            case "long":
              return "long";
            case "double":
              return "double";
            case "boolean":
              return "bool";
            default:
              return "object";
          }
        }
        case "object":
          return "Dictionary<string, object>";
        case "literal":
          return unwrapped.shape.value.type === "stringLiteral"
            ? `"${unwrapped.shape.value.value}"`
            : String(unwrapped.shape.value.value);
        case "list":
          return `List<${toString(unwrapped.shape.itemShape)}>`;
        case "set":
          return `HashSet<${toString(unwrapped.shape.itemShape)}>`;
        case "map":
          return `Dictionary<${toString(unwrapped.shape.keyShape)}, ${toString(unwrapped.shape.valueShape)}>`;
        case "enum":
          return "enum";
        case "undiscriminatedUnion":
        case "discriminatedUnion":
        case "unknown":
        default:
          return "object";
      }
    }

    return (
      <span ref={ref} {...props} className={cn("font-mono", props.className)}>
        {`: ${toString(shape)}${isOptional ? "?" : ""}`}
      </span>
    );
  }
);

const TypeAnnotationRuby = forwardRef<HTMLSpanElement, TypeAnnotationProps>(
  function TypeAnnotationRuby({ shape, isOptional, ...props }, ref) {
    const types = useTypeDefinitions();

    function toString(shape: ApiDefinition.TypeShapeOrReference): string {
      const unwrapped = ApiDefinition.unwrapReference(shape, types);
      switch (unwrapped.shape.type) {
        case "primitive": {
          switch (unwrapped.shape.value.type) {
            case "string":
            case "uuid":
            case "base64":
              return "String";
            case "date":
              return "Date";
            case "datetime":
              return "DateTime";
            case "bigInteger":
            case "integer":
            case "uint":
            case "uint64":
            case "long":
              return "Integer";
            case "double":
              return "Float";
            case "boolean":
              return "Boolean";
            default:
              return "Object";
          }
        }
        case "object":
          return "Struct";
        case "literal":
          return unwrapped.shape.value.type === "stringLiteral"
            ? `"${unwrapped.shape.value.value}"`
            : String(unwrapped.shape.value.value);
        case "list":
          return `::Array[${toString(unwrapped.shape.itemShape)}]`;
        case "set":
          return `::Set[${toString(unwrapped.shape.itemShape)}]`;
        case "map":
          return `::Hash[${toString(unwrapped.shape.keyShape)}, ${toString(unwrapped.shape.valueShape)}]`;
        case "enum":
          return "::Enum";
        case "undiscriminatedUnion":
          return `${unwrapped.shape.variants
            .slice(0, 3)
            .map((variant) => toString(variant.shape))
            .join(
              " | "
            )}${unwrapped.shape.variants.length > 3 ? " | ..." : ""}`;
        case "discriminatedUnion":
          return "::Object";
        case "unknown":
        default:
          return "::Object";
      }
    }

    return (
      <span ref={ref} {...props} className={cn("font-mono", props.className)}>
        {`: ${toString(shape)}${isOptional ? " (optional)" : ""}`}
      </span>
    );
  }
);

const TypeAnnotationDefault = forwardRef<HTMLSpanElement, TypeAnnotationProps>(
  function TypeAnnotationDefault({ shape, isOptional, ...props }, ref) {
    const types = useTypeDefinitions();
    const title = renderTypeShorthand(shape, { isOptional }, types);
    return (
      <span ref={ref} {...props}>
        {title}
      </span>
    );
  }
);
