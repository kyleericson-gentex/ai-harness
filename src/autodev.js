import { readPrompt, readJson, writeJson, getTimestamp, replaceTokens, joinObjects } from './services/utils.js';
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

        let loopCounts = {}

        while (current !== todo.break && current !== null && current !== undefined) {

            const phase = {
                data: phaseDefinitions[current],
                workflow: wf
            };

            const maxRetries = phase.data.maxRetries || 0;

            if (loopCounts[phase.data.name]) {
                loopCounts[phase.data.name]++;
            } else {
                loopCounts[phase.data.name] = 0;
            }

            if (loopCounts[phase.data.name] > maxRetries) {
                logger.app.info({ message: `Retry limit reached for ${phase.data.name}, stopping` });
                todo.state = "stopped";
                todo.result = "retry_limit_reached";
                break;
            }

            if (loopCounts[phase.data.name] > 0) {
                logger.app.info({ message: `${phase.data.name} retry ${loopCounts[phase.data.name]}\n` });
            } else {
                logger.app.info({ message: `${phase.data.name}\n` });
            }


            let prompt = replaceTokens({
                content: readPrompt(phase.data.prompt),
                tokens: [
                    { token: "objective",        value: todo.objective },
                    { token: "artifactLocation", value: `${artifactRoot}/${timestamp}` },
                    { token: "artifact",         value: `${artifactRoot}/${timestamp}/${phase.data.artifact}` },
                    { token: "statusArtifact",   value: `${artifactRoot}/${timestamp}/${statusArtifact}` },
                    { token: "previousArtifact", value: previous ? `${artifactRoot}/${timestamp}/${phaseDefinitions[previous].artifact}` : "HARNESS_ERROR" }
                ]
            });

            if(phase.workflow[current].before) {
                await phase.workflow[current].before();
            }

            // const result = await executePrompt({
            //     repo: todo.repo,
            //     prompt: prompt,
            // });

            if(phase.workflow[current].after) {
                await phase.workflow[current].after();
            }

            // todo:debug:
            process.exit()

            if (result.code !== 0) {
                logger.app.error(`Something went wrong: ${result.stderr}`);
                process.exit(result.code);
            }


            previous = current;
            todo.lastCompletedPhase = previous;
            todo.result = readJson(`${todo.repo}/${artifactRoot}/${timestamp}/${statusArtifact}`).status.toLowerCase();

            if (todo.result === "pass") {
                current = phase.workflow.success || null;
            } else {
                current = phase.workflow.failure || null;
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
