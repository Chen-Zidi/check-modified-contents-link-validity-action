const core = require('@actions/core');
const github = require('@actions/github');

//for access to the url
var https = require("https");
var cheerio = require("cheerio");

var content = '';
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

// core.info(`Pull Request Comment Body: "${pullRequestBody}"`);
// core.info(`Pull Request changes: "${diffUrl}"`);
// console.log("diff:");
// console.log(diffUrl);

var HOST_NAME = 'https://github.com';
var REDIRECTED_HOST_NAME = 'patch-diff.githubusercontent.com';
var options = { 
    host: REDIRECTED_HOST_NAME,
    path: '/raw' + diffUrl.substr(HOST_NAME.length),   // the remaining file path under the host
    headers: {
        'User-Agent': 'Mozilla/5.0 (X11; Linux x86_64; rv:52.0) Gecko/20100101 Firefox/52.0',
        'Accept-Charset': 'utf-8;q=1',
        'Accept-Encoding': '*;q=0',
        'Connection':'close'
      },
      agent: false,
      method: 'GET',

};

// console.log(options.path);

https.get(options,function(res){
  var str = "";
  console.log('Response is '+res.statusCode);
  res.on("data",function(chunk){
      str += chunk;
  })
  res.on("end",function(){
      console.log(str);
      content = str;
  })
})

core.setOutput("content", content);

