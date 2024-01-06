CREATE TABLE `servers` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text NOT NULL,
	`domain` text NOT NULL,
	`last_updated` integer DEFAULT (unixepoch(CURRENT_TIMESTAMP)) NOT NULL,
	`max_players` integer DEFAULT 2 NOT NULL
);
--> statement-breakpoint
CREATE TABLE `users` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`email` text NOT NULL,
	`full_name` text NOT NULL,
	`phone` text(256)
);
--> statement-breakpoint
CREATE UNIQUE INDEX `servers_domain_unique` ON `servers` (`domain`);--> statement-breakpoint
CREATE UNIQUE INDEX `users_email_unique` ON `users` (`email`);