/**
 * This file was auto-generated by Fern from our API Definition.
 */

import * as serializers from "../../../index";
import * as FernGeneratorCli from "../../../../api/index";
import * as core from "../../../../core";
import { TypescriptInfo } from "./TypescriptInfo";
import { PythonInfo } from "./PythonInfo";
import { GoInfo } from "./GoInfo";
import { JavaInfo } from "./JavaInfo";
import { RubyInfo } from "./RubyInfo";
import { CsharpInfo } from "./CsharpInfo";

export const LanguageInfo: core.serialization.Schema<serializers.LanguageInfo.Raw, FernGeneratorCli.LanguageInfo> =
    core.serialization
        .union("type", {
            typescript: TypescriptInfo,
            python: PythonInfo,
            go: GoInfo,
            java: JavaInfo,
            ruby: RubyInfo,
            csharp: CsharpInfo,
        })
        .transform<FernGeneratorCli.LanguageInfo>({
            transform: (value) => {
                switch (value.type) {
                    case "typescript":
                        return FernGeneratorCli.LanguageInfo.typescript(value);
                    case "python":
                        return FernGeneratorCli.LanguageInfo.python(value);
                    case "go":
                        return FernGeneratorCli.LanguageInfo.go(value);
                    case "java":
                        return FernGeneratorCli.LanguageInfo.java(value);
                    case "ruby":
                        return FernGeneratorCli.LanguageInfo.ruby(value);
                    case "csharp":
                        return FernGeneratorCli.LanguageInfo.csharp(value);
                    default:
                        return value as FernGeneratorCli.LanguageInfo;
                }
            },
            untransform: ({ _visit, ...value }) => value as any,
        });

export declare namespace LanguageInfo {
    type Raw =
        | LanguageInfo.Typescript
        | LanguageInfo.Python
        | LanguageInfo.Go
        | LanguageInfo.Java
        | LanguageInfo.Ruby
        | LanguageInfo.Csharp;

    interface Typescript extends TypescriptInfo.Raw {
        type: "typescript";
    }

    interface Python extends PythonInfo.Raw {
        type: "python";
    }

    interface Go extends GoInfo.Raw {
        type: "go";
    }

    interface Java extends JavaInfo.Raw {
        type: "java";
    }

    interface Ruby extends RubyInfo.Raw {
        type: "ruby";
    }

    interface Csharp extends CsharpInfo.Raw {
        type: "csharp";
    }
}
