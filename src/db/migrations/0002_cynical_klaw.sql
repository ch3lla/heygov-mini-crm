ALTER TABLE `contacts` DROP INDEX `contacts_email_unique`;--> statement-breakpoint
ALTER TABLE `contacts` ADD CONSTRAINT `unique_email_per_user` UNIQUE(`user_id`,`email`);