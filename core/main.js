import { workflowService } from "./services/workflow/workflow.service.js";
import { backlogService } from "./services/backlog.service.js";
import { clockIn } from "./services/worker.service.js";
import { logger } from "./services/logger.service.js";


async function run({ customWorkflows = {} } = {}) {
    try {

        workflowService.add(customWorkflows);
        const todos = backlogService.get();
        const updatedTodos = await clockIn({ todos: todos });
        backlogService.save(updatedTodos);
        return updatedTodos;

    } catch (err) {
        throw err;
    }
}



async function getBacklog() {
    try {

        const todos = backlogService.get();
        return todos;

    } catch (err) {
        throw err;
    }
}


async function test() {
    try {

        logger.app.info({ message: "test passed" });

    } catch (err) {
        throw err;
    }
}



export const harness = {
    run,
    getBacklog,
    test
}
