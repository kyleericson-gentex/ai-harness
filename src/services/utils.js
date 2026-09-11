import { appendFileSync, existsSync, readFileSync, writeFileSync } from 'fs';


const projectRoot = new URL('../../', import.meta.url);



function promptUser({ question, rlInterface }) {
    return new Promise((resolve) => {
        rlInterface.question(question, (answer) => {
            resolve(answer);
        });
    });
}


function readFile(path) {
    return readFileSync(path, 'utf8');
}


function readJson(path) {
    try {
        const content = readFileSync(path, 'utf8');
        return JSON.parse(content);
    } catch {
        console.log("Error: Failed to read json file");
        return null;
    }
}

function writeJson(data, path) {
    try {
        writeFileSync(path, JSON.stringify(data), 'utf8');
        return true;
    } catch (err) {
        console.log("Error: Failed to read json config", err);
        return false;
    }
}


export function readBacklog() {
    return readJson(new URL(`./backlog.json`, projectRoot));
}

export function writeBacklog(data) {
    return writeJson(data, new URL(`./backlog.json`, projectRoot));
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
    return readFile(new URL(`./prompts/${file}`));
}


export function log({ message }) {
    const logFilePath = new URL('./log', projectRoot);
    writeFileSync(logFilePath, message);
}

