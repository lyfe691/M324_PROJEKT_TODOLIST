package com.example.demo;

import static org.junit.jupiter.api.Assertions.assertTrue;

import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;

@SpringBootTest
class DemoApplicationTests {

	@Test
	void contextLoads() {
		System.out.println("TEST LÄUFT: Spring Boot Kontext geladen erfolgreich!");
		assertTrue(true, "Spring Boot Kontext sollte erfolgreich geladen werden");
	}

}
