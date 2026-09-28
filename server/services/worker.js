import { readFile, getTimestamp, replaceTokens } from './services/utils.js';
import { executePrompt } from './services/ai.js';
import { phaseDefinitions } from './phases.js';
import { workflowService } from './services/workflow.js';
import { todoService } from './services/todo.js';
import { repoService } from './services/repo.js';
import { logger } from './services/logger.js';



export async function clockIn() {

    let updatedTodos = [];
    const todos = todoService.get();

    for (let i = 0; i < todos.length; i++) {

        const todo = todos[i];

        if (todo.state && (todo.state === 'complete' || todo.state === 'on_hold')) {
            updatedTodos.push(todo);
            continue;
        }

        const timestamp = getTimestamp();

        logger.app.info({ message: `Todo: ${i + 1}/${todos.length}` });
        logger.app.info({ message: `Session: ${timestamp}` });
        logger.app.info({ message: `Repo: ${todo.repo}` });
        logger.app.info({ message: `Objective: ${todo.objective}\n` });


        let wf = workflowService.get(todo.workflow);
        if (!wf) {
            updatedTodos.push(todo);
            continue;
        }

        let current = null;
        let previous = null;

        if (todo.state && todo.lastCompletedPhase) {
            previous = todo.lastCompletedPhase
            current = phaseDefinitions[todo.lastCompletedPhase].success;
        } else {
            todo.state = "active";
            todo.lastCompletedPhase = "";
            todo.result = "";
            current = wf.start;
        }

        let phaseLoops = {};
        let totalLoops = 0;

        while (totalLoops < 25 && current !== todo.break && current !== null && current !== undefined) {

            const phase = phaseDefinitions[current];
            const flow = wf[current];

            const maxRetries = flow.maxRetries || 0;

            if (phaseLoops[current] === undefined || phaseLoops[current] === null) {
                phaseLoops[current] = 0;
            } else {
                phaseLoops[current]++;
            }

            if (phaseLoops[current] > maxRetries) {
                logger.app.info({ message: `Retry limit reached for ${current}, stopping` });
                todo.state = "stopped";
                todo.result = "retry_limit_reached";
                break;
            }

            if (phaseLoops[current] > 0) {
                logger.app.info({ message: `${current} retry ${phaseLoops[current]}\n` });
            } else {
                logger.app.info({ message: `${current}\n` });
            }

            let artRoot = repoService.getArtifactRoot();
            let statusArt = repoService.getStatusArtifact();

            let prompt = replaceTokens({
                content: readFile(`${phase.prompt}`),
                tokens: [
                    { token: "objective",        value: todo.objective },
                    { token: "artifactLocation", value: `${artRoot}/${timestamp}` },
                    { token: "artifact",         value: `${artRoot}/${timestamp}/${phase.artifact}` },
                    { token: "statusArtifact",   value: `${artRoot}/${timestamp}/${statusArt}` },
                    { token: "previousArtifact", value: previous ? `${artRoot}/${timestamp}/${phaseDefinitions[previous].artifact}` : "HARNESS_ERROR" }
                ]
            });

            if(flow.before) {
                await flow.before();
            }

            const result = await executePrompt({
                repo: todo.repo,
                prompt: prompt,
            });

            if(flow.after) {
                await flow.after();
            }

            if (result.code !== 0) {
                logger.app.error(`Something went wrong: ${result.stderr}`);
                process.exit(result.code);
            }

            previous = current;
            todo.lastCompletedPhase = previous;
            todo.result = repoService.readStatus(todo.repo, timestamp);

            if (todo.result === "pass") {
                current = flow.success || null;
            } else {
                current = flow.failure || null;
            }

            totalLoops++;
        }

        if (current === null || current === undefined) {
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

