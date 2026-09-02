import { prompt } from './copilot.js';

function buildPrompt({ phasePrompt, objective, agentPrompt }) {

    const prompt = `
    ${agentPrompt}

    ---

    # Objective

    ${objective}

    ---

    ${phasePrompt}

    `;

    return prompt;
}


export async function work({ repo, phasePrompt, objective, agentPrompt }) {

    const _prompt = buildPrompt({
        phasePrompt: phasePrompt,
        objective: objective,
        agentPrompt: agentPrompt
    }); 

    // console.log(_prompt);

    return await prompt({ 
        repo: repo, 
        prompt: _prompt
    });
}
