# IT Development AI-ntern


Want to suck all the joy out of programming? You've come to the right place.
This harness will let the AI do the fun part and leaves the boring part to you!

Just pretend to review the code, push it, and tell everyone you wrote it yourself.





## about

This runs a series of "phases" (which are just prompts) that cover a development pipeline: 

- [discovery](./core/prompts/discovery.html)
- [plan](./core/prompts/plan.html)
- [create_tasks](./core/prompts/create_tasks.html)
- [implement](./core/prompts/implement.html)
- [review](./core/prompts/review.html)


Also see [phase definitions](./core/services/phase/phase_definitions.js) and [workflows](./core/services/workflow/workflow_definitions.js)


`!!NOTE!! for now, this uses the copilot cli flag '--allow-all' so you know, be careful or whatever`






## installation

- make sure you have node installed
- clone this repository
- make sure you have github copilot cli working
- create `./.data/backlog.json` in this project's root folder


Start the server 

- cd into `./server`
- run `npm install`
- run `npm start` to start the server
- server can be hit at `localhost:42069`





## usage

Right now this can be run by using a cli command, or starting the server and making an api call. 


### cli

From the root dir
```
node ./cli/main.js
```


### server api


Get the backlog
```
GET localhost:42069/backlog
```

Run each todo in the entire backlog
```
POST localhost:42069/backlog/run
```





## backlog.json

Should be located in the project directory at: `./.data/backlog.json`

This file is ignored by git. 

The backlog.json file is just a list of todos

This file will also be updated by the harness to update the state of the todos as they are being run.

You can manipulate these yourself as needed. For example adding a break point or changing the `lastCompletedPhase` to start from a specific
phase, or changing the state to skip a todo.



### todo object

```js
{
    // required
    // the path to the repository we are working with
    "sourceRepo": "",

    // required
    // the objective of this todo
    "objective": "",

    // optional
    // the phase you would like the harness to stop at
    // will stop just before this phase
    "break": "",

    // optional
    // the workflow you would like to use
    // default is 'standard'
    "workflow": "",

    // optional
    // the current state of this todo
    // this is updated by the harness as todos are completed
    // *NOTE* those marked with "complete" or "on_hold" will be skipped
    "state": "",

    // optional
    // the last completed phase
    // this is updated by the harness as todos are completed
    "lastCompletedPhase": "",

    // optional
    // the lastCompletedPhase end result
    // this is updated by the harness as todos are completed
    "result": "",

    // optional
    // this is mostly for harness usage, this keeps track of the session information
    // eventually this will be used if you want to continue a session, but right now that doesnt work
    "session": {
        // session's id
        "id": "202610011125",

        // session's workspace location
        "workspace": "/path/to/harness/repo/.data/workspaces/202610011125/",

        // session's LLM artifact location
        "artifacts": "/path/to/harness/repo/.data/workspaces/202610011125/artifacts/"
    },
}
```


### example of backlog.json

```json
{
    "todos": [
        {
            "sourceRepo": "path/to/local/project/repository",
            "objective": "improve logging"
        },
        {
            "sourceRepo": "path/to/local/project/repository",
            "objective": "improve logging",
            "break": "plan",
            "session": {
                "id": "202610011125",
                "workspace": "/path/to/harness/repo/.data/workspaces/202610011125/",
                "artifacts": "/path/to/harness/repo/.data/workspaces/202610011125/artifacts/"
            },
            "state": "stopped",
            "lastCompletedPhase": "discovery",
            "result": "breakpoint_reached"
        },
        {
            "sourceRepo": "path/to/local/project/repository",
            "objective": "find and fix any security vulnerabilities",
            "break": "plan"
        },
        {
            "sourceRepo": "path/to/local/project/repository",
            "workflow": "custom",
            "objective": "improve documentation"
        },
        {
            "sourceRepo": "path/to/local/project/repository",
            "objective": "make a super awesome feature that will make me rich",
            "state": "on_hold"
        },
    ]
}

```


### phases and workflows


```js
// Phase definitions define the phases
{

    // key
    discovery: {

        // name of phase, must match key
        name: "discovery",

        // path to prompt file to use
        prompt: "path/to/prompts/example.html",

        // the file name of the artifact this phase will create
        // artifacts are placed in the session's workspace folder at workspace/artifacts
        artifact: "discovery.md",
    },

}
```


```js
// Workflows define the flow of the phases.
{
    // key/name of the workflow
    standard: {
    
        // phase to start with
        start: "discovery",

        // key
        discovery: {

            // key of phase to run after success, null quits
            success: "plan",

            // key of phase to run after failure, null quits
            failure: null,

            // optional
            // maximun number of retries, default is 0
            maxRetries: 0,

            // optional
            // runs this code before phase execution
            before: async function() {},

            // optional
            // runs this code after phase execution
            after: async function() {}
        },

        // key
        plan: {
            success: "create_tasks",
            failure: null,
            before: async function() {
                console.log("Planning started");
            },
            after: async function() {
                console.log("Planning complete");
            }
        }

    }
}
```
