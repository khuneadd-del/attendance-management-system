package com.attendance.attendance_management.service;

import com.attendance.attendance_management.model.User;
import com.attendance.attendance_management.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    // Get all students
    public List<User> getAllStudents() {
        return userRepository.findByRole(User.Role.STUDENT);
    }

    // Get all teachers
    public List<User> getAllTeachers() {
        return userRepository.findByRole(User.Role.TEACHER);
    }

    // Get user by ID
    public User getUserById(Long id) {
        return userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found with id: " + id));
    }

    // Get user by email
    public User getUserByEmail(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found with email: " + email));
    }

    // Add a new student
    public User addStudent(String name, String email) {
        if (userRepository.existsByEmail(email)) {
            throw new RuntimeException("Email already exists: " + email);
        }
        User student = User.builder()
                .name(name)
                .email(email)
                .password(passwordEncoder.encode("student123"))
                .role(User.Role.STUDENT)
                .build();
        return userRepository.save(student);
    }

    // Add a new teacher
    public User addTeacher(String name, String email) {
        if (userRepository.existsByEmail(email)) {
            throw new RuntimeException("Email already exists: " + email);
        }
        User teacher = User.builder()
                .name(name)
                .email(email)
                .password(passwordEncoder.encode("teacher123"))
                .role(User.Role.TEACHER)
                .build();
        return userRepository.save(teacher);
    }

    // Delete a user
    public void deleteUser(Long id) {
        if (!userRepository.existsById(id)) {
            throw new RuntimeException("User not found with id: " + id);
        }
        userRepository.deleteById(id);
    }
}