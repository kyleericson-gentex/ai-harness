import { paths } from "../shared/paths.js";
import { readJson, writeJson } from "../shared/utils.js";

let _todos = null;

const backlogUrl = paths.data('backlog.json');


function get({ path = backlogUrl.pathname, filter = [] } = {}) {

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


function save({ path = backlogUrl.pathname, todos } = {}) {
    if (todos && todos.length) {
        writeJson({ todos: todos }, path);
    }
}



export const backlogService = {
    get,
    save
}
