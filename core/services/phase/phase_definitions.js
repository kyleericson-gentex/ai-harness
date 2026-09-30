
// todo: create a phase service to control and read the phases
//
export const phaseDefinitions = {

    discovery: {
        name: "discovery",
        prompt: "./prompts/discovery.html",
        artifact: "discovery.md",
    },

    plan: {
        name: "plan",
        prompt: "./prompts/plan.html",
        artifact: "plan.md",
    },

    create_tasks: {
        name: "create_tasks",
        prompt: "./prompts/create_tasks.html",
        artifact: "create_tasks.md",
    },

    implement: {
        name: "implement",
        prompt: "./prompts/implement.html",
    },

    review: {
        name: "review",
        prompt: "./prompts/review.html",
        artifact: "fixlist.md",
    },

};
