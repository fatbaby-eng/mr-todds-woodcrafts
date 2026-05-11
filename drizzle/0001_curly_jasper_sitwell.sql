CREATE TABLE `cart_sessions` (
	`id` int AUTO_INCREMENT NOT NULL,
	`sessionId` varchar(128) NOT NULL,
	`items` json NOT NULL DEFAULT ('[]'),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `cart_sessions_id` PRIMARY KEY(`id`),
	CONSTRAINT `cart_sessions_sessionId_unique` UNIQUE(`sessionId`)
);
--> statement-breakpoint
CREATE TABLE `order_items` (
	`id` int AUTO_INCREMENT NOT NULL,
	`orderId` int NOT NULL,
	`productId` int,
	`productName` varchar(255) NOT NULL,
	`productSlug` varchar(255),
	`price` int NOT NULL,
	`quantity` int NOT NULL,
	`woodType` varchar(32),
	`imageUrl` text,
	CONSTRAINT `order_items_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `orders` (
	`id` int AUTO_INCREMENT NOT NULL,
	`orderNumber` varchar(32) NOT NULL,
	`customerEmail` varchar(320) NOT NULL,
	`customerName` varchar(255) NOT NULL,
	`customerPhone` varchar(32),
	`shippingAddress` json NOT NULL,
	`status` enum('PENDING','CONFIRMED','CARVING','FINISHED','SHIPPED','DELIVERED','CANCELLED') NOT NULL DEFAULT 'PENDING',
	`paymentStatus` enum('PENDING','PAID','REFUNDED') NOT NULL DEFAULT 'PENDING',
	`paymentMethod` enum('STRIPE','PAYPAL','CASH','CHECK') NOT NULL DEFAULT 'STRIPE',
	`totalAmount` int NOT NULL,
	`shippingCost` int NOT NULL DEFAULT 0,
	`taxAmount` int NOT NULL DEFAULT 0,
	`trackingNumber` varchar(128),
	`notes` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `orders_id` PRIMARY KEY(`id`),
	CONSTRAINT `orders_orderNumber_unique` UNIQUE(`orderNumber`)
);
--> statement-breakpoint
CREATE TABLE `products` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(255) NOT NULL,
	`slug` varchar(255) NOT NULL,
	`description` text,
	`price` int NOT NULL,
	`woodType` enum('CHERRY','WALNUT','MAPLE','MIXED','OTHER') NOT NULL DEFAULT 'MIXED',
	`category` enum('SPOON','KNIFE','SCOOP','SERVING','CUSTOM') NOT NULL DEFAULT 'SPOON',
	`status` enum('IN_STOCK','MADE_TO_ORDER','SOLD_OUT','RETIRED') NOT NULL DEFAULT 'IN_STOCK',
	`quantity` int NOT NULL DEFAULT 0,
	`leadTimeDays` int,
	`featured` boolean NOT NULL DEFAULT false,
	`images` json NOT NULL DEFAULT ('[]'),
	`dimensions` varchar(100),
	`careInstructions` text,
	`weight` int,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `products_id` PRIMARY KEY(`id`),
	CONSTRAINT `products_slug_unique` UNIQUE(`slug`)
);
--> statement-breakpoint
CREATE TABLE `subscribers` (
	`id` int AUTO_INCREMENT NOT NULL,
	`email` varchar(320) NOT NULL,
	`source` enum('WEBSITE','TRADE_SHOW','INSTAGRAM') NOT NULL DEFAULT 'WEBSITE',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `subscribers_id` PRIMARY KEY(`id`),
	CONSTRAINT `subscribers_email_unique` UNIQUE(`email`)
);
--> statement-breakpoint
CREATE TABLE `trade_shows` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(255) NOT NULL,
	`location` varchar(255) NOT NULL,
	`address` text,
	`boothNumber` varchar(64),
	`startDate` timestamp NOT NULL,
	`endDate` timestamp NOT NULL,
	`isActive` boolean NOT NULL DEFAULT true,
	`notes` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `trade_shows_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `wood_blanks` (
	`id` int AUTO_INCREMENT NOT NULL,
	`woodType` enum('CHERRY','WALNUT','MAPLE','MIXED','OTHER') NOT NULL,
	`dimensions` varchar(100),
	`source` varchar(255),
	`acquiredDate` timestamp,
	`cost` int DEFAULT 0,
	`status` enum('RAW','ROUGH_CUT','CARVING','FINISHED','SOLD') NOT NULL DEFAULT 'RAW',
	`productId` int,
	`notes` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `wood_blanks_id` PRIMARY KEY(`id`)
);
