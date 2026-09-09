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


export async function prompt({ backend, repo, phasePrompt, objective, agentPrompt }) {

    const _prompt = buildPrompt({
        phasePrompt: phasePrompt,
        objective: objective,
        agentPrompt: agentPrompt
    }); 

    // console.log(_prompt);

    return await backend.prompt({ 
        repo: repo, 
        prompt: _prompt
    });
}
