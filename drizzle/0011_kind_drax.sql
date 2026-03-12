CREATE TABLE `qbo_connections` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`realmId` varchar(64) NOT NULL,
	`companyName` varchar(256),
	`accessToken` text NOT NULL,
	`refreshToken` text NOT NULL,
	`tokenExpiry` bigint NOT NULL,
	`refreshTokenExpiry` bigint NOT NULL,
	`environment` varchar(16) NOT NULL DEFAULT 'sandbox',
	`qboCreatedAt` timestamp NOT NULL DEFAULT (now()),
	`qboUpdatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `qbo_connections_id` PRIMARY KEY(`id`)
);
