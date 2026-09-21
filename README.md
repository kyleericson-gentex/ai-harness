# IT AI-ntern

Want to suck all the joy out of programming? You've come to the right place.
This harness will let the AI do the fun part and leaves the boring part to you!

Just pretend to review the code, push it, and tell everyone you wrote it yourself.

(This is a learning project. Not sure how useful this would be for actual development.
I am just learning what I can beyond just using Copilot-CLI and autopilot)


## about

This runs a series of "phases" (which are just prompts) that cover a development pipeline: 

- [discovery](./prompts/discovery.html)
- [plan](./prompts/plan.html)
- [create_tasks](./prompts/create_tasks.html)
- [implement](./prompts/implement.html)
- [review](./prompts/review.html)

Thats all I have for now.

The phase definitions and their workflow is defined [here](./src/phases.js)


`!!NOTE!! for now, this uses the copilot cli flag '--allow-all' so you know, be careful or whatever`


## usage

- make sure you have github copilot cli working
- create a `backlog.json` file in this project's root folder (this file is ignored by git)
- run `node ./main.js`

you can also edit `main.js` to change the backlog file location and inject your own custom workflows.
The standard workflows and custom workflows will be merged.




## backlog.json

A backlog.json file is a list of "todos" you want to automate. You can think of it like the kanban board.

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


Phase definitions example
```js
{
    discovery: {
        name: "discovery",
        prompt: "discovery.html",
        artifact: "discovery.md",
    },

    plan: {
        name: "plan",
        prompt: "plan.html",
        artifact: "plan.md",
    },
}
```


Workflow example
```js
{
    standard: {
        start: "discovery",

        discovery: {
            // phase to run after success, null quits
            success: "plan",
            // phase to run after failure, null quits
            failure: null,
            // pre phase hook
            before: async function() {},
            // post phase hook, will always run, even after failure
            after: async function() {}
        },

        plan: {
            success: null,
            failure: null,
        }
    }
}
```

Custom Workflows
```js

run({ 
    backlog: "path/to/backlog/file.json",
    customWorkflows:  { 
        // custom workflow definitions added here 
    }
});

```



## future stuff?

- [ ] clone repos instead of having to already have them locally
- [ ] poll azure and pull todos from special azure work items
- [ ] push changes to remote
- [ ] test phase with test results looping back into implement like review does

