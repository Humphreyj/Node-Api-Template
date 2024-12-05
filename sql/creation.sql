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

CREATE TABLE `invoices` (
  `id` VARCHAR(36) NOT NULL DEFAULT (UUID()),
  `accountId` CHAR(36) DEFAULT NULL,
  `clientId` VARCHAR(36) NOT NULL,
  `client` JSON DEFAULT NULL,
  `invoiceNumber` VARCHAR(36) NOT NULL,
  `invoiceDate` DATE NOT NULL,
  `dueDate` DATE NOT NULL,
  `invoiceTotal` DECIMAL(10, 2) NOT NULL,
  `lineItems` JSON DEFAULT NULL,
  `status` ENUM('draft', 'paid', 'overdue', 'void') DEFAULT 'draft',
  `createdAt` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  FOREIGN KEY (`clientId`) REFERENCES `profiles`(`id`)
    ON DELETE CASCADE
    ON UPDATE CASCADE,
  INDEX (`clientId`)
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





