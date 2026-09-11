import { appendFileSync, readFileSync, writeFileSync } from 'fs';


const projectRoot = new URL('../../', import.meta.url);



export function promptUser({ question, rlInterface }) {
    return new Promise((resolve) => {
        rlInterface.question(question, (answer) => {
            resolve(answer);
        });
    });
}


export function readBacklog() {
    try {
        const content = readFileSync(
            new URL(`./backlog.json`, projectRoot),
            'utf8'
        );
        return JSON.parse(content);

    } catch {
        console.log("Error: Failed to read json config");
    }
}

export function writeBacklog(data) {
    try {
        writeFileSync(
            new URL(`./backlog.json`, projectRoot),
            JSON.stringify(data),
            'utf8'
        );
        return true;

    } catch (err) {
        console.log("Error: Failed to read json config", err);
        return false;
    }
}


export function validateBreakpoint(bp, max) {
    let breakpoint = bp;
    if (breakpoint === undefined) {
        breakpoint = max;
    } else if (breakpoint < 0 || breakpoint > max - 1 || !Number.isInteger(breakpoint)) {
        console.log(`Error: ${breakpoint} is not a valid breakpoint, must be a valid number (0 - ${max - 1})`);
    }
    return breakpoint;
}


export function readPrompt(file) {
    return readFileSync(
        new URL(`./prompts/${file}`, projectRoot),
        'utf8'
    );
}


export function log({ message }) {
    const logFilePath = new URL('./log', projectRoot);
    writeFileSync(logFilePath, message);
}

