import { prompt } from './copilot.js';

function buildPrompt({ phase, objective, agent }) {

    const prompt = `
    ${agent}

    ---

    # Objective

    ${objective}

    ---

    ${phase}

    `;

    return prompt;
}


export async function executePhase({ repo, phase, objective, agent }) {
    return prompt({ 
        repo: repo, 
        prompt: buildPrompt({
            phase: phase,
            objective: objective,
            agent: agent
        }) 
    });
}
