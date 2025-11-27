CREATE TABLE `contacts` (
	`id` int NOT NULL,
	`first_name` varchar(100) NOT NULL,
	`last_name` varchar(100) NOT NULL,
	`email` varchar(150),
	`phone_number` varchar(150) NOT NULL,
	`company` varchar(150),
	`in_trash` boolean DEFAULT false,
	`is_deleted` boolean DEFAULT false,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `contacts_id` PRIMARY KEY(`id`),
	CONSTRAINT `contacts_email_unique` UNIQUE(`email`),
	CONSTRAINT `phone_or_email_present` CHECK(email IS NOT NULL OR phone_number IS NOT NULL)
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
ALTER TABLE `contacts` ADD CONSTRAINT `contacts_id_users_id_fk` FOREIGN KEY (`id`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;