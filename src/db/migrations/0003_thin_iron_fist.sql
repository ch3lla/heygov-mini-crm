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
ALTER TABLE `contacts` RENAME COLUMN `userId` TO `user_id`;--> statement-breakpoint
ALTER TABLE `contacts` DROP FOREIGN KEY `contacts_userId_users_id_fk`;
--> statement-breakpoint
ALTER TABLE `reminders` ADD CONSTRAINT `reminders_user_id_users_id_fk` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `contacts` ADD CONSTRAINT `contacts_user_id_users_id_fk` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;