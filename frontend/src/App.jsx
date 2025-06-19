import { useEffect, useState } from 'react';

function App() {
  const [todos, setTodos] = useState([]);
  const [taskdescription, setTaskdescription] = useState("");

  // handle form submission - add new task
  const handleSubmit = event => {
    event.preventDefault();
    if (!taskdescription.trim()) return;
    
    console.log("Sending task description to Spring-Server: " + taskdescription);
    fetch("http://localhost:8080/tasks", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ taskdescription: taskdescription })
    })
    .then(response => {
      console.log("Receiving answer after sending to Spring-Server: ");
      console.log(response);
      window.location.href = "/";
      setTaskdescription("");
    })
    .catch(error => console.log(error))
  }

  // update input field state
  const handleChange = event => {
    setTaskdescription(event.target.value);
  }

  // fetch todos on component mount
  useEffect(() => {
    fetch("http://localhost:8080/").then(response => response.json()).then(data => {
      setTodos(data);
    });
  }, []);

  // delete task when done button clicked
  const handleDelete = (event, taskdescription) => {
    console.log("Sending task description to delete on Spring-Server: " + taskdescription);
    fetch(`http://localhost:8080/delete`, {
      method: "POST",
      body: JSON.stringify({ taskdescription: taskdescription }),
      headers: {
        "Content-Type": "application/json"
      }
    })
    .then(response => {
      console.log("Receiving answer after deleting on Spring-Server: ");
      console.log(response);
      window.location.href = "/";
    })
    .catch(error => console.log(error))
  }

  return (
    <div className="app">
      <header className="header">
        <h1>ToDo Liste</h1>
        <span className="task-count">{todos.length} Tasks</span>
      </header>

      <main className="main">
        <section className="add-todo">
          <h2>Neues Todo anlegen</h2>
          <form onSubmit={handleSubmit} className="todo-form">
            <input
              type="text"
              value={taskdescription}
              onChange={handleChange}
              placeholder="Was möchten Sie erledigen?"
              className="todo-input"
            />
            <button 
              type="submit" 
              disabled={!taskdescription.trim()}
              className="add-button"
            >
              Hinzufügen
            </button>
          </form>
        </section>

        <section className="todo-list-section">
          <h2>Ihre Aufgaben</h2>
          {todos.length === 0 ? (
            <p className="empty-state">
              Noch keine Aufgaben vorhanden. Fügen Sie Ihre erste Aufgabe hinzu!
            </p>
          ) : (
            <ul className="todo-list">
              {todos.map((todo, index) => (
                <li key={todo.taskdescription} className="todo-item">
                  <div className="todo-content">
                    <strong>Task {index + 1}</strong>
                    <span>{todo.taskdescription}</span>
                  </div>
                  <button
                    onClick={(event) => handleDelete(event, todo.taskdescription)}
                    className="complete-button"
                    title="Mark as complete"
                  >
                    ✓
                  </button>
                </li>
              ))}
            </ul>
          )}
        </section>
      </main>
    </div>
  );
}

export default App;
