
export const workflows = {

    standard: {

        start: "discovery",

        discovery: {
            success: "plan",
            failure: null,
        },

        plan: {
            success: "create_tasks",
            failure: null,
        },

        create_tasks: {
            success: "implement",
            failure: null,
        },

        implement: {
            success: "review",
            failure: null,
            maxRetries: 3
        },

        review: {
            success: null,
            failure: "implement",
            maxRetries: 3
        }
    }
};
