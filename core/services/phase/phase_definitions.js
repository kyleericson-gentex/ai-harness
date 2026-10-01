import { paths } from "../../shared/paths.js";



export const phaseDefinitions = {

    discovery: {
        name: "discovery",
        prompt: paths.prompts('discovery.html').pathname,
        artifact: "discovery.md",
    },

    plan: {
        name: "plan",
        prompt: paths.prompts('plan.html').pathname,
        artifact: "plan.md",
    },

    create_tasks: {
        name: "create_tasks",
        prompt: paths.prompts('create_tasks.html').pathname,
        artifact: "create_tasks.md",
    },

    implement: {
        name: "implement",
        prompt: paths.prompts('implement.html').pathname,
    },

    review: {
        name: "review",
        prompt: paths.prompts('review.html').pathname,
        artifact: "fixlist.md",
    },

};
