import { spawn } from "node:child_process"

import { logger } from './logger.service.js';
import { copilot } from './copilot.service.js';
// import { opencode } from './opencode.service.js';




const providers = [
    copilot
];



export async function executePrompt({ workspace, prompt, providerId = 0 }) {

        return new Promise((resolve, reject) => {

            const provider = providers[providerId];

            let stdout = '';
            let stderr = '';

            const child = spawn(
                provider.command(), 
                provider.options(prompt), 
                { 
                    cwd: workspace,
                    maxBuffer: 50 * 1024 * 1024
                }
            );

            child.stdout.on('data',(chunk) => {
                logger.stream.stdout(chunk);
                stdout += chunk.toString();
            });

            child.stderr.on('data',(chunk) => {
                logger.stream.stderr(chunk);
                stderr += chunk.toString();
            });

            child.on('close', (code) => {
                if (code === 0) {
                    resolve({ code, stdout, stderr });
                } else {
                    reject({ code, stdout, stderr });
                }
            });
        });
}
