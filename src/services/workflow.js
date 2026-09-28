import { workflows } from '../workflows.js';
import { logger } from './logger.js';


let _workflows = workflows;


export const workflowService = {

    async add({ customWorkflows = {} }) {
        _workflows = joinObjects([ workflows, customWorkflows ]);
    },

    async get(workflow) {
        const name = workflow || "standard";
        const wf =  _workflows[name];
        if(!wf) {
            logger.app.error({ message: `Workflow ${name} not found` });
        }
        return wf;
    }

}

