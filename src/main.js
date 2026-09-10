import {
    readPrompt,
    readBacklog,
    writeBacklog
} from './services/utils.js';
import { runPrompt } from './services/ai.js';
import { phaseDefinitions, phaseWorkflows } from './phases.js';
import { exit } from 'process';


let artifactLocation = "./.ai";


async function doWork(todos) {

    let updatedTodos = [];

    for (let i = 0; i < todos.length; i++) {
        const todo = todos[i];

        if (todo.state && (todo.state.status === 'complete' || todo.state.status === 'on_hold')) {
            updatedTodos.push(todo);
            continue;
        }

        console.log(`Todo: ${i + 1}/${todos.length}`);
        console.log(`Repo: ${todo.repo}`);
        console.log(`Objective: ${todo.objective}`);


        let phaseState = {
            current: "discovery",
            previous: null,
        }

        let current = "discovery";
        let previous = null;


        if (todo.state) {
            current = phaseDefinitions[todo.state.last].next.success || null;
            console.log(`Activity: ${todo.state.activity}`);
            console.log(`Last: ${todo.state.last}`);
            console.log(`Resuming At: ${current}`);
        } else {
            todo.state = {};
        }

        console.log("");

        while(current !== todo.break && current !== null && current !== undefined) {

            const phaseDefinition = phaseDefinitions[current];
            const phaseWorkflow = phaseWorkflows[current];

            console.log(`    - Working on ${phaseDefinition.name}`);

            let prompt = readPrompt(phaseDefinition.prompt);

            prompt = prompt
                .replaceAll("#{objective}#", todo.objective)
                .replaceAll("#{artifactLocation}#", artifactLocation)
                .replaceAll("#{artifact}#", `${artifactLocation}/${phaseDefinition.artifact}`)

            if(previous) {
                prompt = prompt.replaceAll("#{previousArtifact}#", `${artifactLocation}/${phaseDefinitions[previous].artifact || ""}`);
            }

            let { pass, stdout, stderr } = await runPrompt({
                repo: todo.repo,
                prompt: prompt
            });

            previous = current;

            if(pass) {
                current = phaseWorkflow.success || null;
                todo.state.status = "pass";
            } else {
                current = phaseWorkflow.failure || null;
                todo.state.status = "fail";
            }

        }

        todo.state.last = previous;

        if (current === null) {
            todo.state.activity = "complete";

        } else if(current === todo.break) {
            todo.state.activity = "active";

        } else {
            todo.state.activity = "error";
        }

        updatedTodos.push(todo);
    }

    return updatedTodos;
}

try {

    console.log("\nClocking in");
    console.log("-----------\n");

    const board = readBacklog();
    const updatedBoard = { todos: await doWork(board.todos) };
    writeBacklog(updatedBoard);

    console.log("\nClocking out");
    console.log("------------\n");

} catch (error) {
    console.error('Error:', error);
} finally {
}
