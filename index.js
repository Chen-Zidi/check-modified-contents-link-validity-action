const core = require('@actions/core');
const github = require('@actions/github');

//for access to the url
var https = require("https");
var cheerio = require("cheerio");

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
core.info(`Pull Request changes: "${diffUrl}"`);
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
    console.log("modified content:");
      console.log(str);
      // core.setOutput("content", str);
      // parse the url=ls
      var strs = httpString(str);
      checkValid(strs);
  })
})

// HERE ADD THE VALIDITY CHECK
function httpString(s){
    // only parse the urls in the ADDED content of the pull request
    // namely the string which has '+' at the head
    // and only urls with a http:// or https:// as a prefix
    arr = s.trim().split('\n');
    console.log(arr);
    var reg1 = /(http:\/\/|https:\/\/)((\w|=|\?|\.|\/|&|-|[\u4e00-\u9fa5])+)/g;
    allStrs = new Array();
    for(var i=0; i<arr.length; i++){    // for each row
        if(arr[i].charAt(0) == "+"){    // one row start with + is the added ones
            lineStrs = arr[i].match(reg1);
            if(lineStrs){
                for(var j=0; j<lineStrs.length; j++){
                    allStrs.append(lineStrs[j]);
                }         
            }
               
        }

    }
    
    // strs = s.match(reg1);
    // if(strs){
    //     for(var i=0; i< strs.length; i++){
    //         strs[i] = strs[i].substr(1); // delete the '+' at the head of the string
    //     }
    // }

    console.log(allStrs);
    return(allStrs);
}

function checkValid(urls){
    if(!urls) return true;  // no urls, no need to check

    for(var i=0; i<urls.length; i++){
        checkValidUrl(urls[i]);
    }
}

async function checkValidUrl(url){
    const request = require('request');
    const util = require('util');
    const getPromise = util.promisify(request.get);


    await getPromise(url).then((value)=>{
        console.log(url + "\nSuccess\n");
        //set output validity
        core.setOutput("validity", true);
    }).catch((err)=>{
        
        console.log(err.toString(),"\n");
        console.log("invalid url:" + url);

        //get github token
        const context_git = github.context;
        let token = process.env["GITHUB_TOKEN"] || "";
        if (token === "") {
          token = core.getInput("token");
        }

        console.log("token",token);
        const client = new github.GitHub(token);
        
        close(client, context_git);

    });

}

//close the pull request because of the invalid link
async function close(client, context){
           
        const body = "There is invalid link inside the modified content. Please check.";
        console.log("Try to close the pull request...");
       
          //core.info("Creating a comment");
          await client.issues.createComment({
            ...context.repo,
            issue_number: context.issue.number,
            body
          });
        

        core.info("Updating the state of a pull request to closed");
        await client.pulls.update({
          ...context.repo,
          pull_number: context.issue.number,
          state: "closed"
        });

        core.info(`Closed a pull request ${context.issue.number}`);
        core.setOutput("validity", false);
}



