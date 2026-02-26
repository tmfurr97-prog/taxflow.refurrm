CREATE TABLE `promo_codes` (
	`id` int AUTO_INCREMENT NOT NULL,
	`code` varchar(32) NOT NULL,
	`label` varchar(128),
	`tierGrant` varchar(32) NOT NULL DEFAULT 'beta_pro',
	`maxUses` int NOT NULL DEFAULT 1,
	`usedCount` int NOT NULL DEFAULT 0,
	`expiresAt` timestamp,
	`isActive` boolean NOT NULL DEFAULT true,
	`createdBy` int NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `promo_codes_id` PRIMARY KEY(`id`),
	CONSTRAINT `promo_codes_code_unique` UNIQUE(`code`)
);
--> statement-breakpoint
CREATE TABLE `promo_redemptions` (
	`id` int AUTO_INCREMENT NOT NULL,
	`codeId` int NOT NULL,
	`userId` int NOT NULL,
	`redeemedAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `promo_redemptions_id` PRIMARY KEY(`id`)
);
