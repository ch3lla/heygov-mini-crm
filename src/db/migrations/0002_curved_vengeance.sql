ALTER TABLE `contacts` DROP CONSTRAINT `phone_or_email_present`;--> statement-breakpoint
ALTER TABLE `contacts` MODIFY COLUMN `first_name` varchar(100);--> statement-breakpoint
ALTER TABLE `contacts` MODIFY COLUMN `last_name` varchar(100);--> statement-breakpoint
ALTER TABLE `contacts` MODIFY COLUMN `phone_number` varchar(150);--> statement-breakpoint
ALTER TABLE `contacts` ADD `notes` varchar(255);--> statement-breakpoint
ALTER TABLE `contacts` ADD CONSTRAINT `name_or_email_present` CHECK (email IS NOT NULL OR first_name IS NOT NULL);