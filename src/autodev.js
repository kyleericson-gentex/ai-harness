import { readFile, readJson, writeJson, getTimestamp, replaceTokens, joinObjects } from './services/utils.js';
import { executePrompt } from './services/ai.js';
import { phaseDefinitions } from './phases.js';
import { workflows } from './workflows.js';
import { logger } from './services/logger.js';


let artifactRoot = "./.ai";
let statusArtifact = `status.json`;




async function doWork(todos, flows) {

    let updatedTodos = [];

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

        let wfName = todo.workflow || "standard";
        let wf = flows[wfName];
        let current = null;
        let previous = null;

        if (!wf) {
            logger.app.error({ message: `Workflow ${wfName} not found` });
            updatedTodos.push(todo);
            continue;
        }


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

            const phase = {
                definition: phaseDefinitions[current],
                wfData: wf[current]
            };

            const maxRetries = phase.wfData.maxRetries || 0;

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


            let prompt = replaceTokens({
                content: readFile(`${phase.definition.prompt}`),
                tokens: [
                    { token: "objective",        value: todo.objective },
                    { token: "artifactLocation", value: `${artifactRoot}/${timestamp}` },
                    { token: "artifact",         value: `${artifactRoot}/${timestamp}/${phase.definition.artifact}` },
                    { token: "statusArtifact",   value: `${artifactRoot}/${timestamp}/${statusArtifact}` },
                    { token: "previousArtifact", value: previous ? `${artifactRoot}/${timestamp}/${phaseDefinitions[previous].artifact}` : "HARNESS_ERROR" }
                ]
            });

            if(phase.wfData.before) {
                await phase.wfData.before();
            }

            const result = await executePrompt({
                repo: todo.repo,
                prompt: prompt,
            });

            if(phase.wfData.after) {
                await phase.wfData.after();
            }

            if (result.code !== 0) {
                logger.app.error(`Something went wrong: ${result.stderr}`);
                process.exit(result.code);
            }

            previous = current;
            todo.lastCompletedPhase = previous;
            todo.result = readJson(`${todo.repo}/${artifactRoot}/${timestamp}/${statusArtifact}`).status.toLowerCase();

            if (todo.result === "pass") {
                current = phase.wfData.success || null;
            } else {
                current = phase.wfData.failure || null;
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


export async function run({ backlog, customWorkflows }) {
    try {

        let allWorkflows = joinObjects([ workflows, customWorkflows ]);

        logger.app.info({ message: "Clocking in\n" });
        const board = readJson(backlog);

        const updatedBoard = { 
            todos: await doWork(board.todos, allWorkflows)
        };

        writeJson(updatedBoard, backlog);
        logger.app.info({ message: "Clocking out" });

    } catch (error) {
        logger.app.error({ message: `Error: ${error}` });
    } finally {

    }
}
