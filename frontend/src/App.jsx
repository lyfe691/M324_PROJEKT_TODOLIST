import { useEffect, useState } from 'react';
import toast, { Toaster } from 'react-hot-toast';

function App() {
  const [todos, setTodos] = useState([]);
  const [taskdescription, setTaskdescription] = useState("");

  // fetch todos from server
  const fetchTodos = async () => {
    try {
      const response = await fetch("http://localhost:8080/");
      const data = await response.json();
      setTodos(data);
    } catch (error) {
      console.error("Error fetching todos:", error);
      toast.error("Fehler beim Laden der Aufgaben");
    }
  };

  // handle form submission - add new task
  const handleSubmit = async (event) => {
  event.preventDefault();
  if (!taskdescription.trim()) return;

  const createdAt = new Date().toISOString(); // Zeitstempel erzeugen

  try {
    const response = await fetch("http://localhost:8080/tasks", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ 
        taskdescription: taskdescription,
        createdAt: createdAt
      })
    });

    if (response.ok) {
      setTaskdescription("");
      toast.success("Aufgabe erfolgreich hinzugefügt!");
      await fetchTodos();
    } else {
      throw new Error("Failed to add task");
    }
  } catch (error) {
    console.error("Error adding task:", error);
    toast.error("Fehler beim Hinzufügen der Aufgabe");
  }
}

  // update input field state
  const handleChange = event => {
    setTaskdescription(event.target.value);
  }

  // fetch todos on component mount
  useEffect(() => {
    fetchTodos();
  }, []);

  // delete task when done button clicked
  const handleDelete = async (event, taskdescription) => {
    console.log("Sending task description to delete on Spring-Server: " + taskdescription);
    
    try {
      const response = await fetch(`http://localhost:8080/delete`, {
        method: "POST",
        body: JSON.stringify({ taskdescription: taskdescription }),
        headers: {
          "Content-Type": "application/json"
        }
      });

      if (response.ok) {
        console.log("Task successfully deleted from Spring-Server");
        toast.success("Aufgabe erfolgreich erledigt!");
        // Update the local state instead of reloading the page
        setTodos(prevTodos => prevTodos.filter(todo => todo.taskdescription !== taskdescription));
      } else {
        throw new Error("Failed to delete task");
      }
    } catch (error) {
      console.error("Error deleting task:", error);
      toast.error("Fehler beim Löschen der Aufgabe");
    }
  }

  return (
    <div className="app">
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 3000,
          style: {
            background: '#363636',
            color: '#fff',
          },
          success: {
            style: {
              background: '#4caf50',
            },
          },
          error: {
            style: {
              background: '#f44336',
            },
          },
        }}
      />
      
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
                  {todo.createdAt && (
                    <small style={{ color: "#888" }}>
                      erstellt am: {new Date(todo.createdAt).toLocaleString()}
                    </small>
                  )}
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
