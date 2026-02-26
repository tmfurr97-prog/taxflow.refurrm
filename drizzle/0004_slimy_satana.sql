ALTER TABLE `users` MODIFY COLUMN `subscriptionTier` enum('free','essential','pro','business') DEFAULT 'free';--> statement-breakpoint
ALTER TABLE `academy_progress` ADD `lessonSlug` varchar(100) NOT NULL;--> statement-breakpoint
ALTER TABLE `users` ADD `stripeSubscriptionId` varchar(64);--> statement-breakpoint
ALTER TABLE `academy_progress` DROP COLUMN `lessonId`;