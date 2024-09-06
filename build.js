const { execSync } = require("child_process");

if (process.argv[2]) {
    execSync("git add -A");
    try {
        execSync(`git commit -m "${process.argv[2]}"`);
    } catch(err) {
        console.error("Can't commit, nothing changed in the project.");
        process.exit(1);
    }
    execSync("git push -u origin master --force");
} else {
    console.log("Please provide a commit message.");
}