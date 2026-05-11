ALTER TABLE `cart_sessions` MODIFY COLUMN `items` json NOT NULL;--> statement-breakpoint
ALTER TABLE `products` MODIFY COLUMN `images` json NOT NULL;