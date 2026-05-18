CREATE TABLE `site_settings` (
	`settingKey` varchar(64) NOT NULL,
	`value` text,
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `site_settings_settingKey` PRIMARY KEY(`settingKey`)
);
--> statement-breakpoint
ALTER TABLE `orders` MODIFY COLUMN `paymentMethod` enum('VENMO','STRIPE','PAYPAL','CASH','CHECK') NOT NULL DEFAULT 'VENMO';
