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


export function readJson(path) {
    try {
        const content = readFileSync(path, 'utf8');
        return JSON.parse(content);
    } catch {
        console.log("Error: Failed to read json file");
        return null;
    }
}

export function writeJson(data, path) {
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
    return readFile(new URL(`./prompts/${file}`, projectRoot));
}


export function getTimestamp() {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0'); // Months are 0-indexed
    const day = String(now.getDate()).padStart(2, '0');
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    return `${year}${month}${day}${hours}${minutes}`;
}


export function getTimestampMs() {
    return new Date();
}

