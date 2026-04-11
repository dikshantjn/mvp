function makeProjectCode(projectName) {
  return projectName
    .toUpperCase()
    .replace(/[^A-Z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 20) || "PROJECT";
}

module.exports = {
  makeProjectCode
};
