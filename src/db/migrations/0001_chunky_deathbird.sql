ALTER TABLE `contacts` DROP FOREIGN KEY `contacts_id_users_id_fk`;
--> statement-breakpoint
ALTER TABLE `contacts` MODIFY COLUMN `id` int AUTO_INCREMENT NOT NULL;--> statement-breakpoint
ALTER TABLE `contacts` ADD `userId` int NOT NULL;--> statement-breakpoint
ALTER TABLE `contacts` ADD CONSTRAINT `contacts_userId_users_id_fk` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;