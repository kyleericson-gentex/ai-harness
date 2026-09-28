import { readJson, writeJson } from "./utils";

let _todos = null;
const _bl = "../.local/backlog.json";
const _test_bl = "../.local/test_bl.json";

// todo:debug: remove this
const _using = _test_bl;

export const todoService = {

    get({ path = _using }) {
        if(!_todos) {
            _todos = readJson(path).todos;
        }
        return _todos;
    },

    save(todos) {
        writeJson({ todos: todos }, _using);
    }

}
