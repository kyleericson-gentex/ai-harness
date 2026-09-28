import { workflowService } from './services/workflow.js';
import { clockIn } from './services/worker.js';
import { logger } from './services/logger.js';
import { todoService } from './services/todo.js';



// todo: make this an express api



// todo:debug: this is just for testing for now
export async function run({ customWorkflows }) {
    try {

        workflowService.add(customWorkflows);
        logger.app.info({ message: "Clocking in\n" });
        todoService.save(await worker.clockIn());
        logger.app.info({ message: "Clocking out" });

    } catch (error) {
        logger.app.error({ message: `Error: ${error}` });
    } finally {

    }
}

