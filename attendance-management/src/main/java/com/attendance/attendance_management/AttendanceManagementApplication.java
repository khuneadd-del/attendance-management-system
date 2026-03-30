package com.attendance.attendance_management;

import com.attendance.attendance_management.model.Subject;
import com.attendance.attendance_management.model.User;
import com.attendance.attendance_management.repository.SubjectRepository;
import com.attendance.attendance_management.repository.UserRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Bean;
import org.springframework.security.crypto.password.PasswordEncoder;

@SpringBootApplication
public class AttendanceManagementApplication {

	public static void main(String[] args) {
		SpringApplication.run(AttendanceManagementApplication.class, args);
	}

	@Bean
	CommandLineRunner seedData(UserRepository userRepository,
	                           SubjectRepository subjectRepository,
	                           PasswordEncoder passwordEncoder) {
		return args -> {
			if (userRepository.count() == 0) {
				User admin = userRepository.save(User.builder()
						.name("Admin User")
						.email("admin@mail.com")
						.password(passwordEncoder.encode("admin123"))
						.role(User.Role.ADMIN)
						.build());

				User teacher = userRepository.save(User.builder()
						.name("Prof. Desai")
						.email("desai@mail.com")
						.password(passwordEncoder.encode("teacher123"))
						.role(User.Role.TEACHER)
						.build());

				userRepository.save(User.builder()
						.name("Aditya Sharma")
						.email("aditya@mail.com")
						.password(passwordEncoder.encode("student123"))
						.role(User.Role.STUDENT)
						.build());

				// Seed subjects assigned to teacher
				subjectRepository.save(Subject.builder()
						.name("Mathematics")
						.code("MATH101")
						.teacher(teacher)
						.build());

				subjectRepository.save(Subject.builder()
						.name("Physics")
						.code("PHY101")
						.teacher(teacher)
						.build());

				subjectRepository.save(Subject.builder()
						.name("Computer Science")
						.code("CS101")
						.teacher(teacher)
						.build());

				System.out.println("✅ Seed data loaded!");
			}
		};
	}
}