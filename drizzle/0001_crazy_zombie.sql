CREATE TABLE `audit_items` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`taxYear` int NOT NULL,
	`irsNoticeType` varchar(64),
	`noticeDate` varchar(32),
	`responseDeadline` varchar(32),
	`status` enum('open','in_progress','resolved','closed') DEFAULT 'open',
	`description` text,
	`documentUrl` varchar(1024),
	`notes` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `audit_items_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `backups` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`backupType` varchar(32),
	`fileUrl` varchar(1024),
	`fileKey` varchar(512),
	`fileSize` int,
	`status` enum('creating','ready','failed') DEFAULT 'creating',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `backups_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `business_entities` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`entityName` varchar(255) NOT NULL,
	`entityType` varchar(32) NOT NULL,
	`ein` varchar(20),
	`state` varchar(2),
	`formationDate` varchar(32),
	`registeredAgent` varchar(255),
	`status` enum('active','inactive','dissolved') DEFAULT 'active',
	`complianceData` json,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `business_entities_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `chat_messages` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`sessionId` varchar(64),
	`role` enum('user','assistant','system') NOT NULL,
	`content` text NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `chat_messages_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `crypto_transactions` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`taxYear` int NOT NULL,
	`asset` varchar(32),
	`transactionType` varchar(32),
	`quantity` decimal(18,8),
	`priceUsd` decimal(18,2),
	`totalUsd` decimal(18,2),
	`costBasis` decimal(18,2),
	`gainLoss` decimal(18,2),
	`holdingPeriod` varchar(16),
	`exchange` varchar(64),
	`date` varchar(32),
	`txHash` varchar(128),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `crypto_transactions_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `efile_submissions` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`taxYear` int NOT NULL,
	`submissionType` varchar(32),
	`stateCode` varchar(2),
	`status` enum('draft','validating','submitted','accepted','rejected') DEFAULT 'draft',
	`confirmationNumber` varchar(64),
	`submittedAt` timestamp,
	`acceptedAt` timestamp,
	`rejectionReason` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `efile_submissions_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `mileage_logs` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`taxYear` int NOT NULL,
	`date` varchar(32),
	`startLocation` varchar(255),
	`endLocation` varchar(255),
	`miles` decimal(8,2),
	`purpose` varchar(255),
	`category` varchar(64),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `mileage_logs_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `notary_sessions` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`sessionType` varchar(32) NOT NULL,
	`serviceType` varchar(64),
	`scheduledAt` timestamp,
	`completedAt` timestamp,
	`status` enum('scheduled','in_progress','completed','cancelled') DEFAULT 'scheduled',
	`documentName` varchar(255),
	`documentUrl` varchar(1024),
	`documentKey` varchar(512),
	`signerName` varchar(255),
	`signerEmail` varchar(320),
	`witnessRequired` boolean DEFAULT false,
	`price` decimal(8,2),
	`notes` text,
	`meetingLink` varchar(512),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `notary_sessions_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `quarterly_payments` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`taxYear` int NOT NULL,
	`quarter` int NOT NULL,
	`dueDate` varchar(32),
	`estimatedAmount` decimal(10,2),
	`paidAmount` decimal(10,2),
	`paidDate` varchar(32),
	`confirmationNumber` varchar(64),
	`status` enum('upcoming','due','paid','overdue') DEFAULT 'upcoming',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `quarterly_payments_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `receipts` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`taxYear` int NOT NULL,
	`vendor` varchar(255),
	`amount` decimal(10,2),
	`date` varchar(32),
	`category` varchar(64),
	`description` text,
	`imageUrl` varchar(1024),
	`imageKey` varchar(512),
	`isDeductible` boolean DEFAULT true,
	`ocrData` json,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `receipts_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `tax_documents` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`taxYear` int NOT NULL,
	`documentType` varchar(32) NOT NULL,
	`fileName` varchar(255),
	`fileUrl` varchar(1024),
	`fileKey` varchar(512),
	`status` enum('pending','processing','verified','rejected') DEFAULT 'pending',
	`extractedData` json,
	`notes` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `tax_documents_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `transactions` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`plaidTransactionId` varchar(128),
	`accountId` varchar(128),
	`amount` decimal(10,2),
	`date` varchar(32),
	`description` varchar(512),
	`merchantName` varchar(255),
	`category` varchar(64),
	`taxCategory` varchar(64),
	`isDeductible` boolean DEFAULT false,
	`isReviewed` boolean DEFAULT false,
	`receiptId` int,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `transactions_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `users` ADD `filingStatus` varchar(32);--> statement-breakpoint
ALTER TABLE `users` ADD `state` varchar(2);--> statement-breakpoint
ALTER TABLE `users` ADD `selfEmployed` boolean DEFAULT false;--> statement-breakpoint
ALTER TABLE `users` ADD `homeOwner` boolean DEFAULT false;--> statement-breakpoint
ALTER TABLE `users` ADD `dependents` int DEFAULT 0;--> statement-breakpoint
ALTER TABLE `users` ADD `subscriptionTier` enum('free','weekly','monthly','annual') DEFAULT 'free';--> statement-breakpoint
ALTER TABLE `users` ADD `subscriptionStatus` varchar(32) DEFAULT 'inactive';--> statement-breakpoint
ALTER TABLE `users` ADD `stripeCustomerId` varchar(64);--> statement-breakpoint
ALTER TABLE `users` ADD `referralCode` varchar(16);--> statement-breakpoint
ALTER TABLE `users` ADD `referredBy` varchar(16);