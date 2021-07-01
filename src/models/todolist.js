import Todo from './todo';
import {config} from '../config';

export default class TodoList {
    constructor() {
        this.todos = [];
    }

    get todoList() {
        return this.todos;
    }

    async todoFromServer() {
        let todos = await fetch(`http://${config.development.host}:${config.development.port}/todos`)
            .then(response => response.json())
            .catch(error => console.error('Error:', error));

        todos.forEach(todo => {
            this.todos.push(new Todo(todo));
        });
    }

    async addTodo(title) {
        let todo = await fetch(`http://${config.development.host}:${config.development.port}/todos`, {
            method: 'POST',
            body: JSON.stringify({ title }),
            headers: {
                'Content-Type': 'application/json'
            },
        })
        .then(response => response.json())
        .catch(error => console.error('Error:', error));

        todo = new Todo(todo);
        this.todos.push(todo);
        return todo;
    }

    async removeTodo(id) {
        let todoIdx = this.getIdxTodo(id);
        if (todoIdx === -1) {
            console.log('Nothing to remove!');
            return;
        }

        await fetch(`http://${config.development.host}:${config.development.port}/todos/${id}`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json'
            }
        })
        .then(response => response.text())
        .catch(error => console.error('Error:', error));;
 
        let todo = this.todos[todoIdx];
        this.todos = [...this.todos.slice(0, todoIdx), ...this.todos.slice(todoIdx + 1)];
        return todo;
    }

    async toggleAll(bool) {
        await fetch(`http://${config.development.host}:${config.development.port}/todos`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({isDone: bool})
            })
            .then(response => response.text())
            .catch(error => console.error('Error:', error));
        
        if (bool) {
            for (let todo of this.todos) {
                todo.markDone();
            }
        } else {
            for (let todo of this.todos) {
                todo.markNotDone();
            }
        }
    }

    async removeCopleted() {
        await fetch(`http://${config.development.host}:${config.development.port}/todos`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json'
            }
        })
        .then(response => response.text())
        .catch(error => console.error('Error:', error));
        this.todos = this.getActiveTodo();
    }

    async toggleTodo(id) {
        let todoIdx = this.getIdxTodo(id);
        if (todoIdx === -1) {
            console.log('Todo does not exist!');
            return;
        }

        await fetch(`http://${config.development.host}:${config.development.port}/todos`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ 
                    id: this.todos[todoIdx].getTodoItem('id'),
                    isDone:  !this.todos[todoIdx].getTodoItem('isDone')})
            }).then(response => response.text())
            .catch(error => console.error('Error:', error));
        
        if (this.todos[todoIdx].getTodoItem('isDone')) {
            this.todos[todoIdx].markNotDone();
        } else {
            this.todos[todoIdx].markDone();
        }
    }

    filterTodos(filter) {
        if (filter === 'active') {
          return this.getActiveTodo();
        }
        if (filter === 'completed') {
          return this.getCompletedTodo();
        }
        return this.todoList;
    }
    
    getCompletedTodo() {
        return this.todoList.filter((todo) => todo.isDone === true);
    }
    
    getActiveTodo() {
        return this.todoList.filter((todo) => todo.isDone === false);
    }

    getIdxTodo(id) {
        return this.todos.findIndex(t => t.id === id)
    }

    isTodo(id) {
        if (!id) return null;
        return this.todos[this.getIdxTodo(id)].getTodoItem('position');
    }

    async updateList(prevTodoId, currentTodoId, nextTodoId) {
        let todosPosition = {
            prevTodoPosition: this.isTodo(prevTodoId),
            nextTodoPosition: this.isTodo(nextTodoId)
        }

        let newPosCurrentTodo = await fetch(`http://${config.development.host}:${config.development.port}/dnd/${currentTodoId}`, {
            method: 'PATCH',
            headers: {
                    'Content-Type': 'application/json'
            },
            body: JSON.stringify(todosPosition)
        }).then(response => response.text())
        .catch(error => console.error('Error:', error));

        this.todos[this.getIdxTodo(currentTodoId)].updatePosition(newPosCurrentTodo);
        this.sort();
    }

    sort() {
        this.todos.sort((a,b) => {
            if (a.getTodoItem('position') < b.getTodoItem('position')) return -1;
            if (a.getTodoItem('position') > b.getTodoItem('position')) return 1;
            return 0;
        });
    }
}