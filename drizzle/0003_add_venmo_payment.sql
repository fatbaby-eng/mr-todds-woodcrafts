ALTER TABLE `orders` MODIFY COLUMN `paymentMethod` enum('VENMO','PAYPAL','CASH','CHECK','STRIPE') NOT NULL DEFAULT 'VENMO';--> statement-breakpoint
UPDATE `orders` SET `paymentMethod` = 'VENMO' WHERE `paymentMethod` = 'STRIPE';
