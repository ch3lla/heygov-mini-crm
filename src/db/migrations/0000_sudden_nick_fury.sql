CREATE TABLE `contacts` (
	`id` int AUTO_INCREMENT NOT NULL,
	`first_name` varchar(100),
	`last_name` varchar(100),
	`email` varchar(150),
	`phone_number` varchar(150),
	`company` varchar(150),
	`user_id` int NOT NULL,
	`notes` varchar(255),
	`in_trash` boolean DEFAULT false,
	`is_deleted` boolean DEFAULT false,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `contacts_id` PRIMARY KEY(`id`),
	CONSTRAINT `contacts_email_unique` UNIQUE(`email`),
	CONSTRAINT `name_or_email_present` CHECK(email IS NOT NULL OR first_name IS NOT NULL)
);
--> statement-breakpoint
CREATE TABLE `reminders` (
	`id` int AUTO_INCREMENT NOT NULL,
	`user_id` int NOT NULL,
	`user_email` varchar(150) NOT NULL,
	`title` varchar(255) NOT NULL,
	`description` text,
	`due_date` timestamp NOT NULL,
	`status` varchar(20) DEFAULT 'pending',
	`sent_at` timestamp,
	`created_at` timestamp DEFAULT (now()),
	CONSTRAINT `reminders_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `users` (
	`id` int AUTO_INCREMENT NOT NULL,
	`first_name` varchar(100) NOT NULL,
	`last_name` varchar(100) NOT NULL,
	`password` text NOT NULL,
	`email` varchar(150) NOT NULL,
	`phone_number` varchar(150),
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `users_id` PRIMARY KEY(`id`),
	CONSTRAINT `users_email_unique` UNIQUE(`email`)
);
--> statement-breakpoint
ALTER TABLE `contacts` ADD CONSTRAINT `contacts_user_id_users_id_fk` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `reminders` ADD CONSTRAINT `reminders_user_id_users_id_fk` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;