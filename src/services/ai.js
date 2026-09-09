import { copilot } from './copilot.js';
// import { opencode } from './opencode.js';


const providers = [
    copilot
];



export async function runPrompt({ repo, prompt, provider = 0 }) {
    return await providers[provider].prompt({ 
        repo: repo, 
        prompt: prompt
    });
}

