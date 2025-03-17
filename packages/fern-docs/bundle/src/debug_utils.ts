export function proxyF<T extends (...args: any[]) => any>(fnCall: T) {
  return function (...args: Parameters<T>) {
    console.log(`* Proxying function: ${fnCall.name} *`);
    // console.log("* Arguments start *\n", args, "\n* Arguments end *");

    // If the function is async, we return the Promise it resolves/rejects to.
    const result = fnCall(...args);

    if (result instanceof Promise) {
      return result
        .then((res) => {
          //   console.log(
          //     `** Proxy result for fn (${fnCall.name}): ${JSON.stringify(res, null, 2)}\n`
          //   );
          return res;
        })
        .catch((err: unknown) => {
          throw err;
        });
    }

    // console.log(
    //   `** Proxy result for fn (${fnCall.name}): ${JSON.stringify(result, null, 2)}\n`
    // );
    return result; // For non-async functions, return the result directly
  };
}

// // Log file path as a string
// const logFilePath = "logs.txt";

// // Function to log messages
// export function logMessage(message: string) {
//   const timestamp = new Date().toISOString(); // Get current timestamp
//   const logEntry = `${timestamp} - ${message}\n`;

//   // Append the log entry to the file
//   fs.appendFile(logFilePath, logEntry, (err: any) => {
//     if (err) {
//       console.error("Error writing to log file", err);
//     } else {
//       console.log("Log saved successfully!");
//     }
//   });
// }
