import { FdrAPI } from "@fern-api/fdr-sdk";

export class SdkIdFactory {
  public static fromTypescript(sdk: FdrAPI.TypeScriptSdk): string {
    return `typescript|${sdk.package}|${sdk.version}`;
  }

  public static fromPython(sdk: FdrAPI.PythonSdk): string {
    return `python|${sdk.package}|${sdk.version}`;
  }

  public static fromGo(sdk: FdrAPI.GoSdk): string {
    return `go|${sdk.githubRepo}|${sdk.version}`;
  }

  public static fromRuby(sdk: FdrAPI.RubySdk): string {
    return `ruby|${sdk.gem}|${sdk.version}`;
  }

  public static fromJava(sdk: FdrAPI.JavaSdk): string {
    return `java|${sdk.group}|${sdk.artifact}|${sdk.version}`;
  }
}
