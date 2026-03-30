package com.attendance.attendance_management.controller;

import com.attendance.attendance_management.model.User;
import com.attendance.attendance_management.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:5173")
public class UserController {

    private final UserService userService;

    @GetMapping("/students")
    public ResponseEntity<List<User>> getAllStudents() {
        return ResponseEntity.ok(userService.getAllStudents());
    }

    @GetMapping("/teachers")
    public ResponseEntity<List<User>> getAllTeachers() {
        return ResponseEntity.ok(userService.getAllTeachers());
    }

    @PostMapping("/students")
    public ResponseEntity<User> addStudent(@RequestBody Map<String, String> body) {
        User student = userService.addStudent(body.get("name"), body.get("email"));
        return ResponseEntity.ok(student);
    }

    @PostMapping("/teachers")
    public ResponseEntity<User> addTeacher(@RequestBody Map<String, String> body) {
        User teacher = userService.addTeacher(body.get("name"), body.get("email"));
        return ResponseEntity.ok(teacher);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<String> deleteUser(@PathVariable Long id) {
        userService.deleteUser(id);
        return ResponseEntity.ok("User deleted successfully");
    }
}