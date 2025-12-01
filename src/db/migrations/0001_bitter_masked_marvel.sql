CREATE TABLE `interactions` (
	`id` int AUTO_INCREMENT NOT NULL,
	`user_id` int NOT NULL,
	`contact_id` int NOT NULL,
	`type` varchar(50),
	`summary` text,
	`date` timestamp DEFAULT (now()),
	CONSTRAINT `interactions_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `contacts` ADD `tags` json DEFAULT ('[]');--> statement-breakpoint
ALTER TABLE `interactions` ADD CONSTRAINT `interactions_user_id_users_id_fk` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `interactions` ADD CONSTRAINT `interactions_contact_id_contacts_id_fk` FOREIGN KEY (`contact_id`) REFERENCES `contacts`(`id`) ON DELETE no action ON UPDATE no action;