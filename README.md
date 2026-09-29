# IT AI-ntern

Want to suck all the joy out of programming? You've come to the right place.
This harness will let the AI do the fun part and leaves the boring part to you!

Just pretend to review the code, push it, and tell everyone you wrote it yourself.

(This is a learning project. Not sure how useful this would be for actual development.
I am just learning what I can beyond just using Copilot-CLI and autopilot)


## about

This runs a series of "phases" (which are just prompts) that cover a development pipeline: 

- [discovery](./server/prompts/discovery.html)
- [plan](./server/prompts/plan.html)
- [create_tasks](./server/prompts/create_tasks.html)
- [implement](./server/prompts/implement.html)
- [review](./server/prompts/review.html)

Thats all I have for now.

The phase definitions and their workflow is defined [here](./server/phases.js)


`!!NOTE!! for now, this uses the copilot cli flag '--allow-all' so you know, be careful or whatever`


## usage

- make sure you have github copilot cli working
- create a `./.data/backlog.json` file in this project's root folder (this file is ignored by git)
- cd into `./server`
- run `npm install`
- run `npm start` to start the server
- server can be hit at `localhost:42069`


## api


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



#### todo object

```js
{
    // required
    // the path to the repository we are working with
    "repo": "",

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
    "result": ""
}
```


#### example of backlog.json

```json
{
    "todos": [
        {
            "repo": "path/to/local/project/repository",
            "objective": "improve logging",
            "break": "implement",
            "state": "stopped",
            "lastCompletedPhase": "create_tasks",
            "result": "breakpoint_reached"
        },
        {
            "repo": "path/to/local/project/repository",
            "objective": "find and fix any security vulnerabilities",
            "break": "plan"
        },
        {
            "repo": "path/to/local/project/repository",
            "workflow": "custom",
            "objective": "improve documentation"
        },
        {
            "repo": "path/to/local/project/repository",
            "objective": "make a super awesome feature that will make me rich",
            "state": "on_hold"
        },
    ]
}

```


#### phases and workflows


Phase Definition example
```js
{
    // key
    discovery: {
        // name of phase, must match key
        name: "discovery",
        // path to prompt file to use
        prompt: "./prompts/example.html",
        // the file name of the artifact
        // the default settings puts artifacts in the repo folder at <repo>/.ai/<timestamp>/
        artifact: "discovery.md",
    },
}
```

Phase Workflow example
```js
{
    // key/name of the workflow
    standard: {
    
        // phase to start with
        start: "discovery",

        // key
        discovery: {
            // key of phase to run after success, null quits
            success: null,
            // key of phase to run after failure, null quits
            failure: null,
            // runs this code before phase execution
            before: async function() {},
            // runs this code after phase execution
            after: async function() {}
        }

    }
}
```

## future stuff?

- [ ] clone repos instead of having to already have them locally
- [ ] poll azure and pull todos from special azure work items
- [ ] push changes to remote
- [ ] test phase with test results looping back into implement like review does
- [ ] fun ui to view status of agents and stuff?

