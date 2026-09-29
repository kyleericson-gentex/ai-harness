import { workflows } from './workflow_definitions.js';
import { logger } from '../logger.service.js';


let _workflows = workflows;


export const workflowService = {

    add({ customWorkflows = {} } = {}) {
        _workflows = joinObjects([ workflows, customWorkflows ]);
    },

    get(workflow) {
        const name = workflow || "standard";
        const wf =  _workflows[name];
        if(!wf) {
            logger.app.error({ message: `Workflow ${name} not found` });
        }
        return wf;
    }

}

