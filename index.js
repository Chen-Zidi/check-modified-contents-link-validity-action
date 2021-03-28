const core = require('@actions/core');
const github = require('@actions/github');

// try {
//   // `who-to-greet` input defined in action metadata file
//   const nameToGreet = core.getInput('who-to-greet');
//   console.log(`Hello ${nameToGreet}!`);
//   const time = (new Date()).toTimeString();
//   core.setOutput("time", time);
//   // Get the JSON webhook payload for the event that triggered the workflow
//   const payload = JSON.stringify(github.context.payload, undefined, 2)
//   console.log(`The event payload: ${payload}`);
// } catch (error) {
//   core.setFailed(error.message);
// }

  const { eventName } = github.context;
  core.info(`Event name: ${eventName}`);

if (eventName !== 'pull_request_target') {
  core.setFailed(`Invalid event: ${eventName}, it should be use on pull_request_target`);
  return;
}

const payload = github.context.payload; // get the comment body
const pullRequestBody = github.context.payload.pull_request.body; // get the comment body
const diffUrl = github.context.payload.pull_request.diff_url;   // get the difference 

core.info(`Pull Request Comment Body: "${pullRequestBody}"`);
core.info(`Pull Request changes: "${diffUrl}"`);
console.log("diff:");
console.log(diffUrl);