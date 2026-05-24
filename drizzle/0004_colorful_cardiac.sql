ALTER TABLE `order_items` ADD `customSelections` json;--> statement-breakpoint
ALTER TABLE `products` ADD `customOptions` json DEFAULT ('[]');--> statement-breakpoint
ALTER TABLE `products` ADD `volumeDiscounts` json DEFAULT ('[]');