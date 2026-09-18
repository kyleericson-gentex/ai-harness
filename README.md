# ai harness

Repo for my own ai harness for developing features. Not sure how useful this would be for actual development, but just learning what I can 
beyond just using Copilot-CLI and autopilot.

This runs a series of "phases" (which are driven by different agent prompts) that cover a development pipeline: 

- [discovery](./prompts/discovery.html)
- [plan](./prompts/plan.html)
- [create_tasks](./prompts/create_tasks.html)
- [implement](./prompts/implement.html)
- [review](./prompts/review.html)

Thats all I have for now

The phase definitions and their workflow is defined [here](./src/phases.js)


`!!NOTE!! for now, this uses the copilot cli flag '--allow-all' so you know, be careful or whatever`


## usage

- make sure you have github copilot cli working
- create a `backlog.json` file in this project's root folder (this file is ignored by git)
- run with `node ./src/main.js`


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


## future stuff?

- clone repos instead of having to already have them locally
- poll azure and pull todos from special azure work items
- push changes to remote
- might be cool to add pre and post phase hooks to the phase definitions to run code between each phase
- test phase with test results looping back into implement like review does
- shoot myself a text or email with gentex notification service when errors happen?

