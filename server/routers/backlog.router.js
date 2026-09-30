import express from 'express';
import { logger } from '../../core/services/logger.service.js';
import { harness } from '../../core/main.js';



export const router = express.Router();



router.route(/^\/?$/)
    .get(async (req, res) => {
        try {

            const todos = await harness.getBacklog();
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

            const body = req.body || {};
            const workflows = body.customWorkflows || {};
            const updatedTodos = await harness.run({ customWorkflows: workflows});

            // res.json(updatedTodos)
            res.json({ message: "backlog started, check logs or something idk" })

        } catch(err) {
            logger.app.error(err.message);
            res.status(500).json({
                message: `Error: ${err.message}`
            });
        }
    });


router.route(/^\/test\/?$/)
    .post(express.json(), async (req, res) => {
        try {

            harness.test();
            res.json({ message: "test passed" })

        } catch(err) {
            logger.app.error(err.message);
            res.status(500).json({
                message: `Error: ${err.message}`
            });
        }
    });
