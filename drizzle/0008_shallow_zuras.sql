CREATE TABLE `home_office_data` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`taxYear` int NOT NULL,
	`officeSquareFeet` decimal(8,2),
	`totalHomeSqFt` decimal(8,2),
	`monthlyRentOrMortgage` decimal(10,2),
	`monthlyUtilities` decimal(10,2),
	`useRegularMethod` boolean DEFAULT true,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `home_office_data_id` PRIMARY KEY(`id`),
	CONSTRAINT `home_office_data_userId_unique` UNIQUE(`userId`)
);
