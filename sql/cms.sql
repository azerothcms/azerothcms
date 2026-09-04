-- AzerothCMS application schema.
-- TrinityCore remains the source of truth for auth.account, characters and
-- realmlist. This database stores portal-owned content and commerce data.

CREATE DATABASE IF NOT EXISTS `cms`
  DEFAULT CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

-- Run this file with a privileged MySQL account so the TrinityCore account can
-- access the new schema. The application itself must not have CREATE/GRANT
-- privileges in production.
GRANT ALL PRIVILEGES ON `cms`.* TO 'trinity'@'localhost';
FLUSH PRIVILEGES;

USE `cms`;

CREATE TABLE IF NOT EXISTS `cms` (
  `content_key` VARCHAR(64) NOT NULL,
  `payload` JSON NOT NULL,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`content_key`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `user_profile` (
  `account_id` INT UNSIGNED NOT NULL,
  `faction` ENUM('Alliance', 'Horde') NOT NULL DEFAULT 'Alliance',
  `member_since` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`account_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `news_article` (
  `id` VARCHAR(64) NOT NULL,
  `slug` VARCHAR(160) NOT NULL,
  `title` VARCHAR(255) NOT NULL,
  `category` ENUM('公告', '活动', '社区') NOT NULL,
  `excerpt` TEXT NOT NULL,
  `content` JSON NOT NULL,
  `published_at` DATE NOT NULL,
  `read_time` VARCHAR(32) NOT NULL,
  `featured` BOOLEAN NOT NULL DEFAULT FALSE,
  `accent` ENUM('gold', 'blue', 'purple') NOT NULL DEFAULT 'blue',
  `status` ENUM('draft', 'published') NOT NULL DEFAULT 'published',
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_news_article_slug` (`slug`),
  KEY `idx_news_article_status_date` (`status`, `published_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `forum_category` (
  `id` VARCHAR(64) NOT NULL,
  `slug` VARCHAR(160) NOT NULL,
  `name` VARCHAR(128) NOT NULL,
  `description` TEXT NOT NULL,
  `accent` ENUM('gold', 'blue', 'purple', 'green') NOT NULL DEFAULT 'blue',
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_forum_category_slug` (`slug`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `forum_thread` (
  `id` VARCHAR(64) NOT NULL,
  `slug` VARCHAR(160) NOT NULL,
  `category_id` VARCHAR(64) NOT NULL,
  `author_account_id` INT UNSIGNED DEFAULT NULL,
  `title` VARCHAR(255) NOT NULL,
  `excerpt` TEXT NOT NULL,
  `body` JSON NOT NULL,
  `tags` JSON NOT NULL,
  `is_pinned` BOOLEAN NOT NULL DEFAULT FALSE,
  `is_hot` BOOLEAN NOT NULL DEFAULT FALSE,
  `view_count` INT UNSIGNED NOT NULL DEFAULT 0,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_forum_thread_slug` (`slug`),
  KEY `idx_forum_thread_category_updated` (`category_id`, `updated_at`),
  CONSTRAINT `fk_forum_thread_category`
    FOREIGN KEY (`category_id`) REFERENCES `forum_category` (`id`)
    ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `forum_reply` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `thread_id` VARCHAR(64) NOT NULL,
  `author_account_id` INT UNSIGNED NOT NULL,
  `body` TEXT NOT NULL,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_forum_reply_thread_created` (`thread_id`, `created_at`),
  CONSTRAINT `fk_forum_reply_thread`
    FOREIGN KEY (`thread_id`) REFERENCES `forum_thread` (`id`)
    ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `shop_product` (
  `id` VARCHAR(64) NOT NULL,
  `slug` VARCHAR(160) NOT NULL,
  `name` VARCHAR(255) NOT NULL,
  `category` ENUM('账号服务', '外观收藏', '坐骑伙伴') NOT NULL,
  `description` TEXT NOT NULL,
  `details` JSON NOT NULL,
  `price` INT UNSIGNED NOT NULL,
  `currency` VARCHAR(32) NOT NULL DEFAULT '点券',
  `accent` ENUM('gold', 'blue', 'purple', 'green') NOT NULL DEFAULT 'blue',
  `featured` BOOLEAN NOT NULL DEFAULT FALSE,
  `active` BOOLEAN NOT NULL DEFAULT TRUE,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_shop_product_slug` (`slug`),
  KEY `idx_shop_product_active` (`active`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `shop_order` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `account_id` INT UNSIGNED NOT NULL,
  `status` ENUM('pending', 'paid', 'cancelled', 'fulfilled') NOT NULL DEFAULT 'pending',
  `total` INT UNSIGNED NOT NULL DEFAULT 0,
  `currency` VARCHAR(32) NOT NULL DEFAULT '点券',
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_shop_order_account_created` (`account_id`, `created_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `shop_order_item` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `order_id` BIGINT UNSIGNED NOT NULL,
  `product_id` VARCHAR(64) NOT NULL,
  `quantity` SMALLINT UNSIGNED NOT NULL,
  `unit_price` INT UNSIGNED NOT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_shop_order_item_order` (`order_id`),
  CONSTRAINT `fk_shop_order_item_order`
    FOREIGN KEY (`order_id`) REFERENCES `shop_order` (`id`)
    ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `realm_override` (
  `realm_id` INT UNSIGNED NOT NULL,
  `status` ENUM('online', 'offline', 'maintenance') DEFAULT NULL,
  `description` TEXT DEFAULT NULL,
  `updated_by` INT UNSIGNED DEFAULT NULL,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`realm_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
