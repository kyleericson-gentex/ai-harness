import { readPrompt, readBacklog, writeBacklog, log } from './services/utils.js';
import { runPrompt } from './services/ai.js';
import { phaseDefinitions, phaseWorkflows } from './phases.js';
import { exit } from 'process';


let artifactLocation = "./.ai";


async function doWork(todos) {

    let updatedTodos = [];

    for (let i = 0; i < todos.length; i++) {
        const todo = todos[i];

        if (todo.state && (todo.state === 'complete' || todo.state === 'on_hold')) {
            updatedTodos.push(todo);
            continue;
        }

        let current = "discovery";
        let previous = null;


        console.log(`Todo: ${i + 1}/${todos.length}`);
        console.log(`Repo: ${todo.repo}`);
        console.log(`Objective: ${todo.objective}`);

        if(todo.state && todo.last) {
            current = phaseDefinitions[todo.last].success;
        } else {
            todo.state = "new";
            todo.last = "";
            todo.result = "";
        }

        console.log(`State: ${todo.state}`);
        console.log(`Last: ${todo.last}`);
        console.log("");


        while(current !== todo.break && current !== null && current !== undefined) {

            const phaseDefinition = phaseDefinitions[current];
            const phaseWorkflow = phaseWorkflows[current];

            console.log(`--- Working on ${phaseDefinition.name}`);

            let prompt = readPrompt(phaseDefinition.prompt);

            prompt = prompt
                .replaceAll("#{objective}#", todo.objective)
                .replaceAll("#{artifactLocation}#", artifactLocation)
                .replaceAll("#{artifact}#", `${artifactLocation}/${phaseDefinition.artifact}`)

            if(previous) {
                prompt = prompt.replaceAll("#{previousArtifact}#", `${artifactLocation}/${phaseDefinitions[previous].artifact || ""}`);
            } else {
                prompt = prompt.replaceAll("#{previousArtifact}#", "HARNESS_ERROR");
            }

            let { pass, stdout, stderr } = await runPrompt({
                repo: todo.repo,
                prompt: prompt
            });

            previous = current;

            if(pass) {
                current = phaseWorkflow.success || null;
                todo.result = "pass";
            } else {
                current = phaseWorkflow.failure || null;
                todo.result = "fail";
            }

        }

        todo.last = previous;

        if (current === null) {
            todo.state = "complete";

        } else if(current === todo.break) {
            todo.state = "active";

        } else {
            todo.state = "error";
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
