import { 
    readPrompt,
    readBacklog,
    writeBacklog,
    validateBreakpoint 
} from './services/utils.js';
import { runPrompt } from './services/ai.js';
import { createInterface } from 'readline';
import { exit } from 'process';


const rl = createInterface({
    input: process.stdin,
    output: process.stdout
});


const phases = [
    "discovery",
    "plan",
    "create_tasks",
    "implement",
    // "review",
    // "security_review",
    // "test",
];


async function doWork(todos) {

    let updatedTodos = [];

    for (let i = 0; i < todos.length; i++) {
        const todo = todos[i];
        if(todo.state && todo.state.status === 'complete') {
            continue;
        }

        console.log(`Todo: ${i + 1}/${todos.length}`);
        console.log(`Repo: ${todo.repo}`);
        console.log(`Objective: ${todo.objective}`);

        const breakpoint = validateBreakpoint(todo.breakpoint, phases.length);
        if(breakpoint < 0) {
            rl.close();
            exit(1);
        }

        if(breakpoint < phases.length) {
            console.log(`Breakpoint: (${breakpoint}) ${phases[breakpoint]}`);
        }

        let start = 0;

        if(todo.state) {
            start = todo.state.last + 1;
            console.log(`Status: ${todo.state.status}`);
            console.log(`Last: (${todo.state.last}) ${phases[todo.state.last]}`);
            console.log(`Resume: (${start}) ${phases[start]}`);
        } else {
            todo.state = {};
        }

        console.log("");

        for (let i = start; i < breakpoint; i++) {
            const p = phases[i];
            console.log(`    - Begin phase (${i}) ${p}`);
            let _prompt = readPrompt(p);
            _prompt = _prompt.replaceAll("#{objective}#", objective)
            await runPrompt({
                repo: todo.repo,
                prompt: _prompt
            });
            todo.state.last = i;
        }

        if(todo.state.last === phases.length - 1) {
            todo.state.status = "complete";
        } else {
            todo.state.status = "in_progress";
        }

        updatedTodos.push(todo);
    }

    return updatedTodos;
}

try {

    console.log("\nClocking in");
    console.log("-----------\n");

    const board = readBacklog();
    const updatedBoard = { todos: await doWork(board.todos) };
    writeBacklog(updatedBoard);

    console.log("\nClocking out");
    console.log("------------\n");

} catch (error) {
    console.error('Error:', error);
} finally {
    rl.close();
}
