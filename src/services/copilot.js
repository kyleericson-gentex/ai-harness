import { execFile } from "node:child_process"
import { promisify } from "node:util"


const execFileAsync = promisify(execFile)


export const copilot = {

    prompt: async function({ repo, prompt }) {

        // string.format("copilot --session-id=%q -p %q --allow-all", session_id, prompt)

        const { stdout } = await execFileAsync(
            "copilot",
            [
                "-s",
                "--prompt",
                prompt,
                "--allow-all"
            ],
            {
                cwd: repo,
                maxBuffer: 50 * 1024 * 1024
            }
        );

        return stdout;
    }
}
