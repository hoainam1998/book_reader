-- CreateTable
CREATE TABLE `author` (
    `author_id` VARCHAR(20) NOT NULL,
    `name` VARCHAR(200) NULL,
    `sex` BOOLEAN NOT NULL,
    `avatar` TEXT NULL,
    `year_of_birth` INTEGER NULL,
    `year_of_dead` INTEGER NULL,
    `story` VARCHAR(255) NULL,

    PRIMARY KEY (`author_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `book` (
    `book_id` VARCHAR(20) NOT NULL,
    `name` TEXT NOT NULL,
    `pdf` TEXT NOT NULL,
    `published_day` VARCHAR(20) NOT NULL,
    `published_time` INTEGER NOT NULL,
    `category_id` VARCHAR(20) NOT NULL,
    `introduce_file` VARCHAR(255) NULL,
    `avatar` TEXT NULL,

    INDEX `FK_BOOK`(`category_id`),
    PRIMARY KEY (`book_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `book_author` (
    `book_id` VARCHAR(20) NOT NULL,
    `author_id` VARCHAR(20) NOT NULL,

    INDEX `AUTHOR_ID`(`author_id`),
    PRIMARY KEY (`book_id`, `author_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `book_image` (
    `book_id` VARCHAR(20) NOT NULL,
    `image` TEXT NOT NULL,
    `name` VARCHAR(250) NOT NULL,

    PRIMARY KEY (`book_id`, `name`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `book_reader` (
    `user_id` VARCHAR(20) NOT NULL,
    `book_id` VARCHAR(20) NOT NULL,

    INDEX `FK_BOOK_READER_BOOK`(`book_id`),
    PRIMARY KEY (`user_id`, `book_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `category` (
    `category_id` VARCHAR(20) NOT NULL,
    `name` VARCHAR(20) NOT NULL,
    `avatar` TEXT NULL,

    PRIMARY KEY (`category_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `user` (
    `user_id` VARCHAR(20) NOT NULL,
    `password` VARCHAR(50) NOT NULL DEFAULT '''namtran''',
    `last_name` VARCHAR(200) NOT NULL,
    `first_name` VARCHAR(200) NOT NULL,
    `avatar` TEXT NOT NULL,
    `email` VARCHAR(250) NOT NULL,
    `mfa_enable` BOOLEAN NOT NULL,
    `otp_code` VARCHAR(10) NULL,

    PRIMARY KEY (`user_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `book` ADD CONSTRAINT `FK_BOOK` FOREIGN KEY (`category_id`) REFERENCES `category`(`category_id`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `book_image` ADD CONSTRAINT `book_image_ibfk_1` FOREIGN KEY (`book_id`) REFERENCES `book`(`book_id`) ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `book_reader` ADD CONSTRAINT `FK_BOOK_READER_BOOK` FOREIGN KEY (`book_id`) REFERENCES `book`(`book_id`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `book_reader` ADD CONSTRAINT `FK_BOOK_READER_USER` FOREIGN KEY (`user_id`) REFERENCES `user`(`user_id`) ON DELETE NO ACTION ON UPDATE NO ACTION;
