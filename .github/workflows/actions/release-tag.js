const { GitHub,context } = require("@actions/github");
const core = require("@actions/core");

(async function run() {
  try {
    const token = process.env.GITHUB_TOKEN
    const tagName = process.env.INPUT_TAG_NAME
    const github = new GitHub(token)
    const { owner, repo} = github
    console.log(token,tagName,owner)

  } catch (error) {
    core.setFailed(error.message);
  }
})();
