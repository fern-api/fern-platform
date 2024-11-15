type ValidationError = {
    message: string;
    path: string[];
};
export class ErrorCollector {
    errors: ValidationError[] = [];

    addError(error: string, accessPath: string[]): void {
        this.errors.push({
            message: error,
            path: accessPath,
        });
    }
}
