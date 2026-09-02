import { appendFileSync, readFileSync, writeFileSync } from 'fs';


const projectRoot = new URL('../../', import.meta.url);



export function promptUser({ question, rlInterface }) {
    return new Promise((resolve) => {
        rlInterface.question(question, (answer) => {
            resolve(answer);
        });
    });
}


export function readTodo() {
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

export function writeTodo(data) {
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


export function readAgent(agent) {
    return readFileSync(
        new URL(`./prompts/agents/${agent}.md`, projectRoot),
        'utf8'
    );
}


export function readPhase(phase) {
    return readFileSync(
        new URL(`./prompts/phases/${phase}.md`, projectRoot),
        'utf8'
    );
}


export function log({ message }) {
    const logFilePath = new URL('./response.log', projectRoot);
    appendFileSync(logFilePath, message);
}

