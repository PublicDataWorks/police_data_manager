const {
  transformIAProOfficerFile
} = require("../src/server/seeder_jobs/transformIAProOfficerFile");

if (!process.argv[1] || !process.argv[2]) {
  console.log("You must provide the source and destination file paths.");
  process.exit(1);
}

console.log("Transforming officer data in file ", process.argv[1]);
console.log("Contents will be written to ", process.argv[2]);
transformIAProOfficerFile(process.argv[1], process.argv[2]);
