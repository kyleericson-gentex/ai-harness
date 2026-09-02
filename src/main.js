import { log, readPhase, readAgent, promptUser, readTodo, writeTodo } from './services/utils.js';
import { work } from './services/ai.js';
import { createInterface } from 'readline';
import { exit } from 'process';


const rl = createInterface({
    input: process.stdin,
    output: process.stdout
});



const phases = [
    {
        name: "discovery",
        agent: "architect"
    },
    {
        name: "plan",
        agent: "architect"
    },
    {
        name: "create_tasks",
        agent: "architect"
    },
    {
        name: "implement",
        agent: "engineer"
    }
    // {
    //     name: "review",
    //     agent: "engineer"
    // },
    // {
    //     name: "security_review",
    //     agent: "cybersecurity"
    // },
    // {
    //     name: "test",
    //     agent: "qa_tester"
    // }
];


async function askObjective() {
    return await promptUser({ question: 'What is the objective: ', rlInterface: rl });
}


async function askRepo() {
    // return await promptUser('Enter the repo path: ');
    return "";
}


async function askBreakpoint({ retries, phaseCount }) {

    if (retries === 0 || retries === null) {
        return null;
    }
    const bp = Number(await promptUser({ question: `Break At (1-${phaseCount} or 0 to run all): `, rlInterface: rl }));
    if (isNaN(bp) || (bp > phaseCount) || (bp < 0)) {
        console.log(`Warn: break point must be a valid number (0 - ${phaseCount})`);
        return askBreakpoint({
            retries: retries - 1,
            phaseCount: phaseCount
        });
    }

    if (bp === 0) {
        return phaseCount;
    }

    return bp;
}


function validateBreakpoint(bp) {
    let breakpoint = bp;
    if (breakpoint === undefined) {
        breakpoint = phases.length;
    } else if (breakpoint < 0 || breakpoint > phases.length - 1 || !Number.isInteger(breakpoint)) {
        console.log(`Error: ${breakpoint} is not a valid breakpoint, must be a valid number (0 - ${phases.length - 1})`);
        exit(1);
    }
    return breakpoint;
}


async function doWork(todos) {

    let workingTodos = [];

    for (let i = 0; i < todos.length; i++) {

        const todo = todos[i];

        if(todo.state && todo.state.status === 'complete') {
            continue;
        }

        console.log(`Todo: ${i + 1}/${todos.length}`);
        console.log(`Repo: ${todo.repo}`);
        console.log(`Objective: ${todo.objective}`);

        const breakpoint = validateBreakpoint(todo.breakpoint);
        if(breakpoint < phases.length) {
            console.log(`Breakpoint: (${breakpoint}) ${phases[breakpoint].name}`);
        }

        let start = 0;

        if(todo.state) {
            start = todo.state.last + 1;
            console.log(`Status: ${todo.state.status}`);
            console.log(`Last: (${todo.state.last}) ${phases[todo.state.last].name}`);
            console.log(`Resume: (${start}) ${phases[start].name}`);
        } else {
            todo.state = {};
        }

        console.log("");

        for (let i = start; i < breakpoint; i++) {

            const p = phases[i];

            console.log(`    - Begin phase (${i}) ${p.name} as ${p.agent} agent`);

            const response = await work({
                repo: todo.repo,
                objective: todo.objective,
                phasePrompt: readPhase(p.name),
                agentPrompt: readAgent(p.agent)
            });

            log({ message: response });
            todo.state.last = i;

        }

        if(todo.state.last === phases.length - 1) {
            todo.state.status = "complete";
        } else {
            todo.state.status = "in_progress";
        }

        workingTodos.push(todo);
    }

    return workingTodos;

}

try {

    console.log("\nClocking in");
    console.log("-----------\n");

    const board = readTodo();
    const updatedBoard = { todos: await doWork(board.todos) };
    writeTodo(updatedBoard);

    console.log("\nClocking out");
    console.log("------------\n");

} catch (error) {
    console.error('Error:', error);
} finally {
    rl.close();
}
