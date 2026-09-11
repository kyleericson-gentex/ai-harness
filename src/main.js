import { readPrompt, readBacklog, writeBacklog, log } from './services/utils.js';
import { runPrompt } from './services/ai.js';
import { phaseDefinitions, phaseWorkflows } from './phases.js';
import { exit } from 'process';


let artifactLocation = "./.ai";
let statusArtifact = `${artifactLocation}/status.json`;


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
            current = phaseDefinitions[todo.lastCompletedPhase].success;
        } else {
            todo.state = "active";
            todo.lastCompletedPhase = "";
            todo.result = "";
        }

        console.log("");


        let loopCounts = { }

        while(current !== todo.break && current !== null && current !== undefined) {

            const phaseDefinition = phaseDefinitions[current];
            const phaseWorkflow = phaseWorkflows[current];
            const maxRetries = phaseDefinition.maxRetries || 0;

            if(loopCounts[phaseDefinition.name]) {
                loopCounts[phaseDefinition.name]++;
            } else {
                loopCounts[phaseDefinition.name] = 0;
            }

            if(loopCounts[phaseDefinition.name] > maxRetries) {
                console.log(`--- Retry limit reached for ${phaseDefinition.name}, stopping`);
                todo.state = "stopped";
                todo.result = "retry_limit_reached";
                break;
            }

            if(loopCounts[phaseDefinition.name] > 0) {
                console.log(`--- Working on ${phaseDefinition.name} retry ${loopCounts[phaseDefinition.name]}`);
            } else {
                console.log(`--- Working on ${phaseDefinition.name}`);
            }

            let prompt = readPrompt(phaseDefinition.prompt);

            prompt = prompt
                .replaceAll("#{objective}#", todo.objective)
                .replaceAll("#{artifactLocation}#", artifactLocation)
                .replaceAll("#{artifact}#", `${artifactLocation}/${phaseDefinition.artifact}`)
                .replaceAll("#{statusArtifact}#", statusArtifact);

            if(previous) {
                prompt = prompt.replaceAll("#{previousArtifact}#", `${artifactLocation}/${phaseDefinitions[previous].artifact || ""}`);
            } else {
                prompt = prompt.replaceAll("#{previousArtifact}#", "HARNESS_ERROR");
            }

            let { stdout, stderr } = await runPrompt({
                repo: todo.repo,
                prompt: prompt
            });

            previous = current;
            todo.lastCompletedPhase = previous;
            todo.result = readJson(statusArtifact).status.toLowerCase();

            if(todo.result === "pass") {
                current = phaseWorkflow.success || null;
            } else {
                current = phaseWorkflow.failure || null;
            }

        }

        if (current === null) {
            todo.state = "complete";
            todo.result = "success";
        } else if(current === todo.break) {
            todo.state = "stopped";
            todo.result = "breakpoint_reached";
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
