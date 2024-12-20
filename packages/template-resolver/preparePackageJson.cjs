const fs = require("fs");

// Function to update the version in package.json and remove "type": "module"
function preparePackageJson(newVersion) {
  const packagePath = "./package.json";

  // Read the package.json file
  fs.readFile(packagePath, "utf8", (err, data) => {
    if (err) {
      console.error(`Error reading package.json`, err);
      return;
    }

    // Parse the JSON data
    let packageJson = JSON.parse(data);

    // Update the version
    packageJson.version = newVersion;

    // Remove the "type": "module" field if it exists
    if (packageJson.type === "module") {
      delete packageJson.type;
    }

    // Remove the "module" key if it exists
    if (packageJson.module != null) {
      delete packageJson.module;
    }

    // Write the updated package.json back to the file
    fs.writeFile(packagePath, JSON.stringify(packageJson, null, 2), (err) => {
      if (err) {
        console.error(`Error writing package.json`, err);
        return;
      }

      console.log("package.json has been updated successfully.");
    });
  });
}

// Example usage: pass the new version as a command line argument
const newVersion = process.argv[2];
if (!newVersion) {
  console.error("Please provide a version number as an argument.");
  process.exit(1);
}

preparePackageJson(newVersion);
