export declare namespace ErrorCollector {
  interface ValidationError {
    message: string;
    path: string[];
  }
  interface ValidationWarning {
    message: string;
    path: string[];
  }
}
/**
 * ErrorCollector is used to collect validation errors and warnings during parsing.
 * It provides methods to track both blocking errors and non-blocking warnings.
 */
export class ErrorCollector {
  public readonly warnings: ErrorCollector.ValidationWarning[] = [];
  public readonly errors: ErrorCollector.ValidationError[] = [];
  /**
   * An error will block parsing
   * @param error
   */
  public error(error: ErrorCollector.ValidationError): void {
    this.errors.push(error);
  }
  /**
   * A warning will not block parsing
   */
  public warning(warning: ErrorCollector.ValidationWarning): void {
    this.warnings.push(warning);
  }
}
