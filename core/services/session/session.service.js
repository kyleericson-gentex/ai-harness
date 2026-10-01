import { promisify } from 'util';
import { exec as cbExec } from "node:child_process"
import { logger } from "../logger.service.js";
import { mkdirSync } from 'fs';
import { paths } from '../../shared/paths.js';



const exec = promisify(cbExec);
const workspaceRootUrl = paths.data('workspaces/');

let sessions = {};



function get(sessionId) {
    return sessions[sessionId];
}


async function create(sessionId, sourceRepo) {
    await createWorkspace(sessionId);
    await cloneSource(sessionId, sourceRepo);
    return sessions[sessionId];
}


function remove() {
    // delete the directory
    // set the session id to null
}


async function createWorkspace(sessionId) {

    const workspaceUrl = new URL(`${sessionId}/`, workspaceRootUrl);
    const artifactsUrl = new URL("artifacts/", workspaceUrl);

    // todo will this block other calls to the API?
    mkdirSync(workspaceUrl, { recursive: true });
    mkdirSync(artifactsUrl, { recursive: true });

    logger.app.info({ message: `Created workspace ${workspaceUrl.pathname}` });

    sessions[sessionId] = {
        id: sessionId,
        workspace: workspaceUrl.pathname,
        artifacts: artifactsUrl.pathname
    }

    return sessions[sessionId];
}


async function cloneSource(sessionId, sourceRepo) {
    const workspacePath = sessions[sessionId].workspace;

    try {
        await exec(`git clone ${sourceRepo} ${workspacePath}repo`);
        logger.app.info({ message: `Cloned ${sourceRepo} into ${workspacePath}` });
    } catch (err) {
        throw err;
    }
}


export const sessionService = {
    get,
    create,
    remove
}
