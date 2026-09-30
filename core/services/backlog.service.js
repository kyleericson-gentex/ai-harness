import { readJson, writeJson } from "./utils.service.js";

let _todos = null;

const backlogPath = new URL('../../.data/backlog.json', import.meta.url);


function get({ path = backlogPath, filter = [] } = {}) {

    if (!_todos) {
        _todos = readJson(path).todos;
    }

    if (filter.length) {
        return _todos.filter((item) => {
            filter.includes(item.id);
        });
    }

    return _todos;
}


function save({ path = backlogPath, todos } = {}) {
    if (todos && todos.length) {
        writeJson({ todos: todos }, path);
    }
}



export const backlogService = {
    get,
    save
}
