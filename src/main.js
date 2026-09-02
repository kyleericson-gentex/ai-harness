import { log, readPhase, readAgent, promptUser, readConfig } from './services/utils.js';
import { executePhase } from './services/ai.js';
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
    if (breakpoint === 0 || breakpoint === undefined) {
        breakpoint = phases.length;
    } else if (breakpoint < 0 || breakpoint > phases.length || !Number.isInteger(breakpoint)) {
        console.log(`Error: ${breakpoint} is not a valid breakpoint, must be a valid number (0 - ${phases.length})`);
        exit(1);
    }
    return breakpoint;
}


async function executeWorkflow({ objective, repo, breakpoint }) {

    for (let i = 0; i < breakpoint; i++) {

        const p = phases[i];

        const agent = readAgent(p.agent);
        const phase = readPhase(p.name);

        console.log(`Begin [${p.name}] as [${p.agent}]`);

        const response = await executePhase({
            repo: repo,
            phase: phase,
            objective: objective,
            agent: agent
        });

        log({ message: response });
    }


    /*

        // check final output, if fail, check error output file and restart if needed

        if(errors) {
            executeWorkflow({ 
                repo: repo,
                objective: "Fix the bug found in .ai/test-result.md"
            });
        }

    */

}



try {

    console.log("\nClocking in");
    console.log("-----------\n");

    const config = readConfig();

    for (let i = 0; i < config.todos.length; i++) {
        const todo = config.todos[i];

        console.log(`--- Todo ${i + 1}`);
        console.log(`Repo: ${todo.repo}`);
        console.log(`Objective: ${todo.objective}`);

        const breakpoint = validateBreakpoint(todo.breakpoint);
        console.log(`Breakpoint: (${breakpoint}) ${phases[breakpoint - 1].name}\n`);

        await executeWorkflow({
            repo: todo.repo,
            objective: todo.objective,
            breakpoint: breakpoint
        });
    }

    console.log("\nClocking out");
    console.log("------------\n");

} catch (error) {
    console.error('Error:', error);
} finally {
    rl.close();
}
