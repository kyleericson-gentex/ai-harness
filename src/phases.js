
export const phaseWorkflows = {
    discovery: {
        success: "plan",
        failure: null
    },

    plan: {
        success: "create_tasks",
        failure: null
    },

    create_tasks: {
        success: "implement",
        failure: null
    },

    implement: {
        success: "review",
        failure: null
    },

    review: {
        success: null,
        failure: "implement"
    }

};

export const phaseDefinitions = {

    discovery: {
        name: "discovery",
        prompt: "discovery.html",
        artifact: "discovery.md",
    },

    plan: {
        name: "plan",
        prompt: "plan.html",
        artifact: "plan.md",
    },

    create_tasks: {
        name: "create_tasks",
        prompt: "create_tasks.html",
        artifact: "create_tasks.md",
    },

    implement: {
        name: "implement",
        prompt: "implement.html",
    },

    review: {
        name: "review",
        prompt: "review.html",
        artifact: "fixlist.md",
        maxRetries: 3
    },

};
