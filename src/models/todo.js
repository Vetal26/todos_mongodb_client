export default class Todo {
    constructor(todo) {
        this.title = todo.title;
        this.id = todo.id;
        this.isDone = todo.isDone;
        this.position = todo.position;
    }

    getTodoItem(key) {
        return this[key];
    }

    markDone() {
        this.isDone = true;
    }

    markNotDone() {
        this.isDone = false;
    }

    updatePosition(pos) {
        this.position = pos;
    }
}