import { useEffect, useState } from 'react';
import {
  Container,
  Typography,
  TextField,
  Button,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  Paper,
  Box,
  AppBar,
  Toolbar,
  Card,
  CardContent,
  Divider,
  Chip
} from '@mui/material';
import {
  CheckCircle,
  Add,
  PlaylistAddCheck
} from '@mui/icons-material';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';

// Create a clean, modern theme
const theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#dc004e',
    },
    background: {
      default: '#f5f5f5',
    },
  },
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
    h4: {
      fontWeight: 600,
    },
  },
  components: {
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          textTransform: 'none',
          fontWeight: 500,
        },
      },
    },
  },
});

function App() {
  const [todos, setTodos] = useState([]);
  const [taskdescription, setTaskdescription] = useState("");

  /** Is called when the html form is submitted. It sends a POST request to the API endpoint '/tasks' and updates the component's state with the new todo.
  ** In this case a new taskdecription is added to the actual list on the server.
  */
  const handleSubmit = event => {
    event.preventDefault();
    if (!taskdescription.trim()) return;
    
    console.log("Sending task description to Spring-Server: " + taskdescription);
    fetch("http://localhost:8080/tasks", {  // API endpoint (the complete URL!) to save a taskdescription
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ taskdescription: taskdescription }) // both 'taskdescription' are identical to Task-Class attribute in Spring
    })
    .then(response => {
      console.log("Receiving answer after sending to Spring-Server: ");
      console.log(response);
      window.location.href = "/";
      setTaskdescription("");             // clear input field, preparing it for the next input
    })
    .catch(error => console.log(error))
  }

   /** Is called when ever the html input field value below changes to update the component's state.
  ** This is, because the submit should not take the field value directly.
  ** The task property in the state is used to store the current value of the input field as the user types into it.
  ** This is necessary because React operates on the principle of state and props, which means that a component's state
  ** determines the component's behavior and render.
  ** If we used the value directly from the HTML form field, we wouldn't be able to update the component's state and react to changes in the input field.
  */
  const handleChange = event => {
    setTaskdescription(event.target.value);
  }

  /** Is called when the component is mounted (after any refresh or F5).
  ** It updates the component's state with the fetched todos from the API Endpoint '/'.
  */
  useEffect(() => {
    fetch("http://localhost:8080/").then(response => response.json()).then(data => {
      setTodos(data);
    });
  }, []);

 /** Is called when the Done-Button is pressed. It sends a POST request to the API endpoint '/delete' and updates the component's state with the new todo.
  ** In this case if the task with the unique taskdescription is found on the server, it will be removed from the list.
  */
  const handleDelete = (event, taskdescription) => {
    console.log("Sending task description to delete on Spring-Server: " + taskdescription);
    fetch(`http://localhost:8080/delete`, { // API endpoint (the complete URL!) to delete an existing taskdescription in the list
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
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box sx={{ flexGrow: 1 }}>
        <AppBar position="static" elevation={0} sx={{ mb: 4 }}>
          <Toolbar>
            <PlaylistAddCheck sx={{ mr: 2 }} />
            <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
              ToDo Liste
            </Typography>
            <Chip 
              label={`${todos.length} Tasks`} 
              color="secondary" 
              variant="outlined"
              sx={{ color: 'white', borderColor: 'white' }}
            />
          </Toolbar>
        </AppBar>

        <Container maxWidth="md">
          <Card sx={{ mb: 4 }}>
            <CardContent>
              <Typography variant="h5" gutterBottom sx={{ mb: 3 }}>
                Neues Todo anlegen
              </Typography>
              <Box component="form" onSubmit={handleSubmit} sx={{ display: 'flex', gap: 2 }}>
                <TextField
                  fullWidth
                  label="Task beschreibung"
                  variant="outlined"
                  value={taskdescription}
                  onChange={handleChange}
                  placeholder="Was möchten Sie erledigen?"
                  sx={{ flexGrow: 1 }}
                />
                <Button
                  type="submit"
                  variant="contained"
                  size="large"
                  startIcon={<Add />}
                  disabled={!taskdescription.trim()}
                  sx={{ minWidth: 120 }}
                >
                  Hinzufügen
                </Button>
              </Box>
            </CardContent>
          </Card>

          <Card>
            <CardContent>
              <Typography variant="h5" gutterBottom>
                Ihre Aufgaben
              </Typography>
              {todos.length === 0 ? (
                <Box sx={{ textAlign: 'center', py: 4 }}>
                  <Typography variant="body1" color="text.secondary">
                    Noch keine Aufgaben vorhanden. Fügen Sie Ihre erste Aufgabe hinzu!
                  </Typography>
                </Box>
              ) : (
                <>
                  <Divider sx={{ mb: 2 }} />
                  <List>
                    {todos.map((todo, index) => (
                      <ListItem 
                        key={todo.taskdescription}
                        sx={{ 
                          mb: 1,
                          bgcolor: 'background.paper',
                          borderRadius: 1,
                          border: '1px solid',
                          borderColor: 'divider'
                        }}
                      >
                        <ListItemText
                          primary={
                            <Typography variant="body1" sx={{ fontWeight: 500 }}>
                              Task {index + 1}
                            </Typography>
                          }
                          secondary={todo.taskdescription}
                        />
                        <ListItemSecondaryAction>
                          <IconButton
                            edge="end"
                            aria-label="complete"
                            onClick={(event) => handleDelete(event, todo.taskdescription)}
                            color="success"
                            sx={{ 
                              '&:hover': { 
                                backgroundColor: 'success.light',
                                color: 'white'
                              }
                            }}
                          >
                            <CheckCircle />
                          </IconButton>
                        </ListItemSecondaryAction>
                      </ListItem>
                    ))}
                  </List>
                </>
              )}
            </CardContent>
          </Card>
        </Container>
      </Box>
    </ThemeProvider>
  );
}

export default App;
