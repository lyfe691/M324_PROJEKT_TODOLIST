package com.example.demo;

import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;
import static org.hamcrest.Matchers.*;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.DisplayName;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

@SpringBootTest
@AutoConfigureMockMvc
class DemoApplicationTests {

	@Autowired
	private MockMvc mockMvc;

	@Autowired
	private DemoApplication demoApplication;

	private final ObjectMapper objectMapper = new ObjectMapper();

	@BeforeEach
	void setUp() {
		// clear the task list before each test to ensure test isolation
		demoApplication.getTasks().clear();
		System.out.println("🧪 Test setup: Task list cleared");
	}

	@Test
	@DisplayName("Spring Boot context loads successfully")
	void contextLoads() {
		System.out.println("✅ TEST: Spring Boot Kontext geladen erfolgreich!");
		assertTrue(true, "Spring Boot Kontext sollte erfolgreich geladen werden");
	}

	@Test
	@DisplayName("GET / returns empty list when no tasks exist")
	void testGetTasks_EmptyList() throws Exception {
		mockMvc.perform(get("/"))
				.andExpect(status().isOk())
				.andExpect(content().contentType(MediaType.APPLICATION_JSON))
				.andExpect(jsonPath("$", hasSize(0)))
				.andExpect(content().json("[]"));
		
		System.out.println("✅ TEST: Empty task list returned correctly");
	}

	@Test
	@DisplayName("POST /tasks successfully adds a new task")
	void testAddTask_Success() throws Exception {
		String taskJson = "{\"taskdescription\":\"Learn Spring Boot Testing\"}";

		mockMvc.perform(post("/tasks")
				.contentType(MediaType.APPLICATION_JSON)
				.content(taskJson))
				.andExpect(status().isOk())
				.andExpect(content().string("redirect:/"));

		// verify the task was added by getting all tasks
		mockMvc.perform(get("/"))
				.andExpect(status().isOk())
				.andExpect(jsonPath("$", hasSize(1)))
				.andExpect(jsonPath("$[0].taskdescription", is("Learn Spring Boot Testing")));

		System.out.println("✅ TEST: Task added successfully");
	}

	@Test
	@DisplayName("POST /tasks prevents duplicate tasks")
	void testAddTask_PreventsDuplicates() throws Exception {
		String taskJson = "{\"taskdescription\":\"Duplicate Task\"}";

		// add task first time
		mockMvc.perform(post("/tasks")
				.contentType(MediaType.APPLICATION_JSON)
				.content(taskJson))
				.andExpect(status().isOk());

		// try to add same task again
		mockMvc.perform(post("/tasks")
				.contentType(MediaType.APPLICATION_JSON)
				.content(taskJson))
				.andExpect(status().isOk())
				.andExpect(content().string("redirect:/"));

		// verify only one task exists
		mockMvc.perform(get("/"))
				.andExpect(status().isOk())
				.andExpect(jsonPath("$", hasSize(1)))
				.andExpect(jsonPath("$[0].taskdescription", is("Duplicate Task")));

		System.out.println("✅ TEST: Duplicate task prevention works");
	}

	@Test
	@DisplayName("POST /tasks handles multiple different tasks")
	void testAddMultipleTasks() throws Exception {
		String[] taskDescriptions = {
			"Task 1: Write tests",
			"Task 2: Deploy application", 
			"Task 3: Review code"
		};

		// add multiple tasks
		for (String desc : taskDescriptions) {
			String taskJson = String.format("{\"taskdescription\":\"%s\"}", desc);
			mockMvc.perform(post("/tasks")
					.contentType(MediaType.APPLICATION_JSON)
					.content(taskJson))
					.andExpect(status().isOk());
		}

		// verify all tasks were added
		mockMvc.perform(get("/"))
				.andExpect(status().isOk())
				.andExpect(jsonPath("$", hasSize(3)))
				.andExpect(jsonPath("$[0].taskdescription", is("Task 1: Write tests")))
				.andExpect(jsonPath("$[1].taskdescription", is("Task 2: Deploy application")))
				.andExpect(jsonPath("$[2].taskdescription", is("Task 3: Review code")));

		System.out.println("✅ TEST: Multiple tasks added successfully");
	}

	@Test
	@DisplayName("POST /delete successfully removes existing task")
	void testDeleteTask_Success() throws Exception {
		// first add a task
		String taskJson = "{\"taskdescription\":\"Task to be deleted\"}";
		mockMvc.perform(post("/tasks")
				.contentType(MediaType.APPLICATION_JSON)
				.content(taskJson))
				.andExpect(status().isOk());

		// verify task was added
		mockMvc.perform(get("/"))
				.andExpect(jsonPath("$", hasSize(1)));

		// delete the task
		mockMvc.perform(post("/delete")
				.contentType(MediaType.APPLICATION_JSON)
				.content(taskJson))
				.andExpect(status().isOk())
				.andExpect(content().string("redirect:/"));

		// verify task was deleted
		mockMvc.perform(get("/"))
				.andExpect(status().isOk())
				.andExpect(jsonPath("$", hasSize(0)))
				.andExpect(content().json("[]"));

		System.out.println("✅ TEST: Task deleted successfully");
	}

	@Test
	@DisplayName("POST /delete handles non-existent task gracefully")
	void testDeleteTask_NotFound() throws Exception {
		String taskJson = "{\"taskdescription\":\"Non-existent task\"}";

		// try to delete non-existent task
		mockMvc.perform(post("/delete")
				.contentType(MediaType.APPLICATION_JSON)
				.content(taskJson))
				.andExpect(status().isOk())
				.andExpect(content().string("redirect:/"));

		// verify list is still empty
		mockMvc.perform(get("/"))
				.andExpect(status().isOk())
				.andExpect(jsonPath("$", hasSize(0)));

		System.out.println("✅ TEST: Non-existent task deletion handled gracefully");
	}

	@Test
	@DisplayName("Complete workflow: Add multiple tasks, delete one, verify remaining")
	void testCompleteWorkflow() throws Exception {
		// add multiple tasks
		String[] tasks = {
			"{\"taskdescription\":\"Task A\"}",
			"{\"taskdescription\":\"Task B\"}",
			"{\"taskdescription\":\"Task C\"}"
		};

		for (String task : tasks) {
			mockMvc.perform(post("/tasks")
					.contentType(MediaType.APPLICATION_JSON)
					.content(task))
					.andExpect(status().isOk());
		}

		// verify all tasks added
		mockMvc.perform(get("/"))
				.andExpect(jsonPath("$", hasSize(3)));

		// delete middle task
		mockMvc.perform(post("/delete")
				.contentType(MediaType.APPLICATION_JSON)
				.content("{\"taskdescription\":\"Task B\"}"))
				.andExpect(status().isOk());

		// verify correct task was deleted and others remain
		mockMvc.perform(get("/"))
				.andExpect(status().isOk())
				.andExpect(jsonPath("$", hasSize(2)))
				.andExpect(jsonPath("$[*].taskdescription", not(hasItem("Task B"))))
				.andExpect(jsonPath("$[*].taskdescription", hasItem("Task A")))
				.andExpect(jsonPath("$[*].taskdescription", hasItem("Task C")));

		System.out.println("✅ TEST: Complete workflow test passed");
	}

	@Test
	@DisplayName("API handles malformed JSON gracefully")
	void testMalformedJson() throws Exception {
		String malformedJson = "{\"invalid\":\"json\"}";

		// this should not crash the application
		mockMvc.perform(post("/tasks")
				.contentType(MediaType.APPLICATION_JSON)
				.content(malformedJson))
				.andExpect(status().isOk());

		// verify no task was added
		mockMvc.perform(get("/"))
				.andExpect(jsonPath("$", hasSize(0)));

		System.out.println("✅ TEST: Malformed JSON handled gracefully");
	}

}
