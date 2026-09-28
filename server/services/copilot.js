
export const copilot = {

    command: function() {
        return "copilot";
    },

    options: function(prompt) {
        return [
            "-s",
            "--prompt", prompt,
            "--allow-all"
            // "--output-format", "json"
        ];
    },
}
