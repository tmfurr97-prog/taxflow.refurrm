CREATE TABLE `academy_courses` (
	`id` int AUTO_INCREMENT NOT NULL,
	`slug` varchar(100) NOT NULL,
	`title` text NOT NULL,
	`description` text,
	`track` varchar(64) NOT NULL,
	`icon` varchar(64),
	`isPremium` int NOT NULL DEFAULT 0,
	`sortOrder` int DEFAULT 0,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `academy_courses_id` PRIMARY KEY(`id`),
	CONSTRAINT `academy_courses_slug_unique` UNIQUE(`slug`)
);
--> statement-breakpoint
CREATE TABLE `academy_lessons` (
	`id` int AUTO_INCREMENT NOT NULL,
	`courseId` int NOT NULL,
	`slug` varchar(100) NOT NULL,
	`title` text NOT NULL,
	`content` text NOT NULL,
	`duration` varchar(32),
	`isPremium` int NOT NULL DEFAULT 0,
	`upsellType` varchar(64),
	`sortOrder` int DEFAULT 0,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `academy_lessons_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `academy_progress` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`lessonId` int NOT NULL,
	`completedAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `academy_progress_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `lead_magnets` (
	`id` int AUTO_INCREMENT NOT NULL,
	`email` varchar(320) NOT NULL,
	`name` varchar(255),
	`source` varchar(64) DEFAULT 'academy',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `lead_magnets_id` PRIMARY KEY(`id`)
);
