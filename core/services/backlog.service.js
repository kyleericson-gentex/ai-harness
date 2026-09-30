import { readJson, writeJson } from "./utils.service.js";

let _todos = null;


function get({ path = "../.data/backlog.json", filter = [] } = {}) {

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


function save({ path = "../.data/backlog.json", todos } = {}) {
    if (todos && todos.length) {
        writeJson({ todos: todos }, path);
    }
}



export const backlogService = {
    get,
    save
}
