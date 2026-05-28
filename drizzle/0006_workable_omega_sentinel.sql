CREATE TABLE `site_content` (
	`id` int AUTO_INCREMENT NOT NULL,
	`key` varchar(255) NOT NULL,
	`value` text,
	`label` varchar(255) NOT NULL,
	`category` varchar(255) NOT NULL,
	`type` enum('text','textarea','image','color') NOT NULL DEFAULT 'text',
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `site_content_id` PRIMARY KEY(`id`),
	CONSTRAINT `site_content_key_unique` UNIQUE(`key`)
);
