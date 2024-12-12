CREATE TABLE `profiles` (
  `id` VARCHAR(36) NOT NULL DEFAULT (UUID()),
  `first_name` VARCHAR(255) DEFAULT NULL,
  `last_name` VARCHAR(255) DEFAULT NULL,
  `full_name` VARCHAR(255) DEFAULT NULL,
  `email` VARCHAR(255) DEFAULT NULL,
  `phone` VARCHAR(255) DEFAULT NULL,
  `address` JSON DEFAULT NULL,
  `role` VARCHAR(255) DEFAULT NULL,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE (`email`),
  PRIMARY KEY (`id`),
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;


CREATE TABLE `accounts` (
  `id` VARCHAR(36) NOT NULL DEFAULT (UUID()),
  `primaryContact` VARCHAR(36) NOT NULL,
  `companyName` VARCHAR(255) NOT NULL,
  `companyAddress` JSON,
  `companyPhone` VARCHAR(36),
  `companyEmail` VARCHAR(36),
  `subscriptionPlan` VARCHAR(36),
  `billingInfo` JSON,
  PRIMARY KEY (`id`),
  FOREIGN KEY (`primaryContact`) REFERENCES `profiles`(`id`)
  ON DELETE CASCADE
  ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE
  `invoices` (
    `id` varchar(36) NOT NULL DEFAULT(uuid()),
    `accountId` char(36) DEFAULT NULL,
    `clientId` varchar(36) NOT NULL,
    `client` json DEFAULT NULL,
    `invoiceNumber` varchar(36) NOT NULL,
    `invoiceDate` datetime DEFAULT NULL,
    `dueDate` datetime DEFAULT NULL,
    `invoiceTotal` decimal(10, 2) NOT NULL,
    `lineItems` json DEFAULT NULL,
    `status` enum('draft', 'unpaid', 'paid', 'overdue', 'void') DEFAULT NULL,
    `createdAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `lastSentDate` datetime DEFAULT NULL,
    `comments` text,
    `discount` float DEFAULT NULL,
    `totalDiscount` float DEFAULT NULL,
    PRIMARY KEY (`id`),
    KEY `clientId` (`clientId`),
    CONSTRAINT `invoices_ibfk_1` FOREIGN KEY (`clientId`) REFERENCES `profiles` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
  ) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci








