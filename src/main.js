
import { readPrompt, readBacklog, writeBacklog, readJson, getTimestamp, replaceTokens } from './services/utils.js';
import { executePrompt } from './services/ai.js';
import { phaseDefinitions, phaseWorkflows } from './phases.js';
import { logger } from './services/logger.js';


let artifactRoot = "./.ai";
let statusArtifact = `status.json`;


async function doWork(todos) {

    let updatedTodos = [];

    for (let i = 0; i < todos.length; i++) {

        const todo = todos[i];

        const timestamp = getTimestamp();

        if (todo.state && (todo.state === 'complete' || todo.state === 'on_hold')) {
            updatedTodos.push(todo);
            continue;
        }

        let current = "discovery";
        let previous = null;

        logger.app.info({ message: `Todo: ${i + 1}/${todos.length}` });
        logger.app.info({ message: `Session: ${timestamp}` });
        logger.app.info({ message: `Repo: ${todo.repo}` });
        logger.app.info({ message: `Objective: ${todo.objective}\n` });

        if (todo.state && todo.lastCompletedPhase) {
            previous = todo.lastCompletedPhase
            current = phaseDefinitions[todo.lastCompletedPhase].success;
        } else {
            todo.state = "active";
            todo.lastCompletedPhase = "";
            todo.result = "";
        }

        let loopCounts = {}

        while (current !== todo.break && current !== null && current !== undefined) {

            const phaseDefinition = phaseDefinitions[current];
            const phaseWorkflow = phaseWorkflows[current];
            const maxRetries = phaseDefinition.maxRetries || 0;

            if (loopCounts[phaseDefinition.name]) {
                loopCounts[phaseDefinition.name]++;
            } else {
                loopCounts[phaseDefinition.name] = 0;
            }

            if (loopCounts[phaseDefinition.name] > maxRetries) {
                logger.app.info({ message: `Retry limit reached for ${phaseDefinition.name}, stopping` });
                todo.state = "stopped";
                todo.result = "retry_limit_reached";
                break;
            }

            if (loopCounts[phaseDefinition.name] > 0) {
                logger.app.info({ message: `${phaseDefinition.name} retry ${loopCounts[phaseDefinition.name]}\n` });
            } else {
                logger.app.info({ message: `${phaseDefinition.name}\n` });
            }


            let prompt = replaceTokens({
                content: readPrompt(phaseDefinition.prompt),
                tokens: [
                    { token: "objective",        value: todo.objective },
                    { token: "artifactLocation", value: `${artifactRoot}/${timestamp}` },
                    { token: "artifact",         value: `${artifactRoot}/${timestamp}/${phaseDefinition.artifact}` },
                    { token: "statusArtifact",   value: `${artifactRoot}/${timestamp}/${statusArtifact}` },
                    { token: "previousArtifact", value: previous ? `${artifactRoot}/${timestamp}/${phaseDefinitions[previous].artifact}` : "HARNESS_ERROR" }
                ]
            });

            const result = await executePrompt({
                repo: todo.repo,
                prompt: prompt,
            });


            if (result.code !== 0) {
                console.error(`Something went wrong: ${result.stderr}`);
                process.exit(result.code);
            }


            previous = current;
            todo.lastCompletedPhase = previous;
            todo.result = readJson(`${todo.repo}/${artifactRoot}/${timestamp}/${statusArtifact}`).status.toLowerCase();

            if (todo.result === "pass") {
                current = phaseWorkflow.success || null;
            } else {
                current = phaseWorkflow.failure || null;
            }

        }

        if (current === null) {
            todo.state = "complete";
            todo.result = "success";
        } else if (current === todo.break) {
            todo.state = "stopped";
            todo.result = "breakpoint_reached";
            logger.app.info({ message: "breakpoint reached" });
        }

        updatedTodos.push(todo);
    }

    return updatedTodos;
}



try {
    logger.app.info({ message: "Clocking in\n" });
    const board = readBacklog();
    const updatedBoard = { todos: await doWork(board.todos) };
    writeBacklog(updatedBoard);
    logger.app.info({ message: "Clocking out" });
} catch (error) {
    logger.app.error({ message: `Error: ${error}` });
} finally {
}
