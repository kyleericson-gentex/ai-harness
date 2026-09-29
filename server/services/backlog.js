import { readJson, writeJson } from "./utils.js";

let _todos = null;


export const backlogService = {

    get({ path = "../.local/backlog.json", filter = [] } = {}) {

        if(!_todos) {
            _todos = readJson(path).todos;
        }

        if(filter.length) {
            return _todos.filter((item) => {
                filter.includes(item.id);
            });
        }

        return _todos;
    },


    save({ path = "../.local/backlog.json", todos } = {}) {
        if(todos && todos.length) {
            writeJson({ todos: todos }, path);
        }
    }

}
