import express from 'express';

import { clockIn } from '../services/worker.js';
import { workflowService } from '../services/workflow.js';
import { backlogService } from '../services/backlog.js';
import { logger } from '../services/logger.js';

export const router = express.Router();



router.route(/^\/?$/)
    .get(async (req, res) => {
        try {

            const todos = backlogService.get();
            res.json({ todos: todos });

        } catch(err) {
            logger.app.error({ message: err.message });
            res.status(500).json({
                message: `Error: ${err.message}`
            });
        }
    });



router.route(/^\/run\/?$/)
    .post(express.json(), async (req, res) => {
        try {

            const body = req.body;

            if(body) {
                workflowService.add(body.customWorkflows);
            }

            const todos = backlogService.get();

            const updatedTodos = await clockIn({ todos: todos });

            backlogService.save(updatedTodos);
            // res.json(updatedTodos)
            res.json({ message: "backlog started, check logs or something idk" })

        } catch(err) {
            logger.app.error(err.message);
            res.status(500).json({
                message: `Error: ${err.message}`
            });
        }
    });
