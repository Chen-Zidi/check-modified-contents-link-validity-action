const core = require('@actions/core');
const github = require('@actions/github');

//for access to the url
var https = require("https");

const { eventName } = github.context;
core.info(`Event name: ${eventName}`);

if (eventName !== 'pull_request_target') {
  core.setFailed(`Invalid event: ${eventName}, it should be use on pull_request_target`);
}

const payload = github.context.payload; // get the comment body
const pullRequestBody = github.context.payload.pull_request.body; // get the comment body
const diffUrl = github.context.payload.pull_request.diff_url;   // get the difference 

// core.info(`Pull Request Comment Body: "${pullRequestBody}"`);
core.info(`Pull Request changes can be seen on: "${diffUrl}"`);

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

https.get(options,function(res){
  var str = "";
  console.log('Response is '+res.statusCode);
  res.on("data",function(chunk){
      str += chunk;
  })
  res.on("end",function(){
      // console.log("modified content:");
      // console.log(str);
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
    console.log("Pull Request modified info: \n" + arr + "\n");
    var reg1 = /(http:\/\/|https:\/\/)((\w|=|\?|\.|\/|&|-|[\u4e00-\u9fa5])+)/g;
    allStrs = new Array();
    // get the added urls
    for(var i=0; i<arr.length; i++){    
        if(arr[i].charAt(0) == "+"){    // one row start with + is the added ones
            lineStrs = arr[i].match(reg1);
            if(lineStrs){
                for(var j=0; j<lineStrs.length; j++){
                    allStrs.push(lineStrs[j]);
                }         
            }      
        }
    }
  
    console.log("The added urls:\n"+allStrs+"\n");
    return(allStrs);
}

function checkValid(urls){
    if(urls.length == 0) { // no urls, no need to check
      core.setOutput("validity", true);
      return;
    }

    for(var i=0; i<urls.length; i++){
        checkValidUrl(urls[i]);
    }
}

async function checkValidUrl(url){
    const request = require('request');
    const util = require('util');
    const getPromise = util.promisify(request.get);

    console.log("try to get: " + url + "...");
    await getPromise(url).then((value)=>{
        console.log(url + "\nSuccess\n");
        //set output validity
        core.setOutput("validity", true);
    }).catch((err)=>{
        console.log(err.toString());

        //get github token
        const context_git = github.context;
        let token = process.env["GITHUB_TOKEN"] || "";
        if (token === "") {
          token = core.getInput("token");
        }

        const client = new github.GitHub(token);
        
        close(client, context_git, url);

    });

}

//close the pull request because of the invalid link
async function close(client, context, url){
        const body = "There is invalid link inside the modified content: "+ url + " ,Please check.";
        core.info("Try to create a comment and close the pull request...\n");
       
        await client.issues.createComment({
          ...context.repo,
          issue_number: context.issue.number,
          body
        });
        
        await client.pulls.update({
          ...context.repo,
          pull_number: context.issue.number,
          state: "closed"
        });

        core.info(`Closed pull request ${context.issue.number} successfully`);
        core.setOutput("validity", false);
}



