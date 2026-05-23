ALTER TABLE `products` MODIFY COLUMN `woodType` enum('CHERRY','WALNUT','MAPLE','APRICOT','MIXED','OTHER') NOT NULL DEFAULT 'MIXED';--> statement-breakpoint
ALTER TABLE `wood_blanks` MODIFY COLUMN `woodType` enum('CHERRY','WALNUT','MAPLE','APRICOT','MIXED','OTHER') NOT NULL;--> statement-breakpoint
ALTER TABLE `products` ADD `allowsCustomWood` boolean DEFAULT false NOT NULL;