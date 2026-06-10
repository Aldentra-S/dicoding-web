-- MariaDB dump 10.19  Distrib 10.4.32-MariaDB, for Win64 (AMD64)
--
-- Host: localhost    Database: smart-finance-2
-- ------------------------------------------------------
-- Server version	10.4.32-MariaDB

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `bookings`
--

DROP TABLE IF EXISTS `bookings`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `bookings` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `user_id` int(11) NOT NULL,
  `consultant_id` int(11) NOT NULL,
  `health_check_id` int(11) DEFAULT NULL,
  `booking_date` date NOT NULL,
  `booking_time` time NOT NULL,
  `duration_minutes` int(11) DEFAULT 60,
  `consultation_method` varchar(50) DEFAULT 'chat',
  `topic` text DEFAULT NULL,
  `status` enum('pending','booked','completed','cancelled','rejected') DEFAULT 'pending',
  `total_fee` int(11) DEFAULT NULL,
  `notes` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `session_type` varchar(50) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `user_id` (`user_id`),
  KEY `consultant_id` (`consultant_id`),
  KEY `health_check_id` (`health_check_id`),
  CONSTRAINT `bookings_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  CONSTRAINT `bookings_ibfk_2` FOREIGN KEY (`consultant_id`) REFERENCES `consultants` (`id`) ON DELETE CASCADE,
  CONSTRAINT `bookings_ibfk_3` FOREIGN KEY (`health_check_id`) REFERENCES `financial_health_checks` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB AUTO_INCREMENT=64 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `bookings`
--

LOCK TABLES `bookings` WRITE;
/*!40000 ALTER TABLE `bookings` DISABLE KEYS */;
INSERT INTO `bookings` VALUES (1,1,1,NULL,'2026-06-12','10:00:00',60,'video_meeting','Konsultasi tentang manajemen utang','booked',0,NULL,'2026-04-04 03:47:56','2026-04-04 03:47:56',NULL),(2,5,1,NULL,'2026-04-09','19:00:00',60,'chat',NULL,'booked',0,NULL,'2026-04-09 09:40:25','2026-04-09 09:40:25',NULL),(3,5,1,NULL,'2026-04-09','15:00:00',60,'chat',NULL,'booked',0,NULL,'2026-04-09 09:41:29','2026-04-09 09:41:29',NULL),(9,11,2,NULL,'2026-04-21','16:00:00',60,'video_meeting',NULL,'cancelled',100000,NULL,'2026-04-19 01:49:54','2026-04-19 01:50:10',NULL),(10,11,3,NULL,'2026-04-20','09:00:00',60,'video_meeting',NULL,'booked',95000,NULL,'2026-04-19 02:14:25','2026-04-19 02:14:25',NULL),(18,11,2,NULL,'2026-05-20','15:00:00',60,'video_meeting',NULL,'booked',100000,NULL,'2026-05-14 14:06:15','2026-05-14 14:06:15',NULL),(21,11,1,NULL,'2026-05-20','16:00:00',60,'chat',NULL,'cancelled',90000,NULL,'2026-05-14 14:29:16','2026-05-15 04:07:24',NULL),(22,11,2,NULL,'2026-05-18','13:00:00',60,'chat',NULL,'booked',100000,NULL,'2026-05-14 15:11:40','2026-05-14 15:11:40',NULL),(26,11,3,NULL,'2026-05-17','10:00:00',60,'video_meeting',NULL,'booked',95000,NULL,'2026-05-14 16:09:49','2026-05-14 16:09:49',NULL),(27,11,3,NULL,'2026-05-17','11:00:00',60,'chat',NULL,'booked',95000,NULL,'2026-05-14 16:14:38','2026-05-14 16:14:38',NULL),(28,11,2,NULL,'2026-05-21','11:00:00',60,'video_meeting',NULL,'cancelled',100000,NULL,'2026-05-14 16:16:14','2026-05-15 04:06:43',NULL),(29,11,3,NULL,'2026-05-20','14:00:00',60,'video_meeting',NULL,'booked',95000,NULL,'2026-05-15 03:47:15','2026-05-15 03:47:15',NULL),(30,11,1,NULL,'2026-05-19','10:00:00',60,'video_meeting',NULL,'booked',90000,NULL,'2026-05-15 09:27:10','2026-05-15 09:27:10',NULL),(31,11,3,NULL,'2026-05-16','09:00:00',60,'chat',NULL,'booked',95000,NULL,'2026-05-15 09:47:51','2026-05-15 09:47:51',NULL),(32,11,3,NULL,'2026-05-16','10:00:00',60,'video_meeting',NULL,'booked',95000,NULL,'2026-05-15 09:51:06','2026-05-15 09:51:06',NULL),(33,20,2,NULL,'2026-05-22','10:00:00',60,'video_meeting',NULL,'booked',100000,NULL,'2026-05-21 15:03:43','2026-05-21 15:03:43',NULL),(34,20,2,NULL,'2026-05-23','09:00:00',60,'video_meeting',NULL,'booked',100000,NULL,'2026-05-22 05:27:23','2026-05-22 05:27:23',NULL),(35,20,2,NULL,'2026-05-23','10:00:00',60,'video_meeting',NULL,'booked',100000,NULL,'2026-05-22 06:07:14','2026-05-22 06:07:14',NULL),(36,20,2,NULL,'2026-05-28','15:00:00',60,'video_meeting',NULL,'cancelled',100000,NULL,'2026-05-22 06:34:21','2026-05-22 07:25:18',NULL),(37,11,2,NULL,'2026-05-24','10:00:00',60,'video_meeting',NULL,'cancelled',100000,NULL,'2026-05-22 06:49:56','2026-05-22 07:25:15',NULL),(38,11,2,NULL,'2026-05-23','11:00:00',60,'video_meeting',NULL,'booked',100000,'https://zoom.us/j/9737417406','2026-05-22 07:02:30','2026-05-22 07:02:43',NULL),(39,21,3,NULL,'2026-05-29','13:00:00',60,'chat',NULL,'booked',95000,NULL,'2026-05-22 07:04:16','2026-05-22 07:04:25',NULL),(40,21,2,NULL,'2026-05-23','13:00:00',60,'chat',NULL,'booked',100000,NULL,'2026-05-22 07:04:58','2026-05-22 07:05:15',NULL),(41,21,2,NULL,'2026-05-23','15:00:00',60,'chat',NULL,'booked',100000,NULL,'2026-05-22 07:06:19','2026-05-22 07:06:26',NULL),(42,21,1,NULL,'2026-05-23','09:00:00',60,'chat',NULL,'booked',90000,NULL,'2026-05-22 07:14:38','2026-05-22 07:14:49',NULL),(43,21,2,NULL,'2026-05-23','14:00:00',60,'chat',NULL,'cancelled',100000,NULL,'2026-05-22 07:26:18','2026-05-22 07:26:26',NULL),(44,21,2,NULL,'2026-05-24','11:00:00',60,'chat',NULL,'booked',100000,NULL,'2026-05-22 07:26:55','2026-05-22 07:27:02',NULL),(45,21,2,NULL,'2026-05-25','11:00:00',60,'chat',NULL,'cancelled',100000,NULL,'2026-05-22 07:27:53','2026-05-22 07:28:01',NULL),(46,21,2,NULL,'2026-05-29','14:00:00',60,'video_meeting',NULL,'cancelled',100000,NULL,'2026-05-22 10:06:09','2026-05-22 10:06:18',NULL),(47,21,3,NULL,'2026-05-23','09:00:00',60,'chat',NULL,'booked',95000,NULL,'2026-05-22 10:18:32','2026-05-22 10:18:41',NULL),(48,21,3,NULL,'2026-05-23','10:00:00',60,'video_meeting',NULL,'',95000,'Ditolak oleh admin.','2026-05-22 10:19:22','2026-05-22 10:19:44',NULL),(49,21,1,NULL,'2026-05-23','10:00:00',60,'chat',NULL,'',90000,'Ditolak oleh admin.','2026-05-22 10:24:32','2026-05-22 10:24:42',NULL),(50,21,1,NULL,'2026-05-23','15:00:00',60,'video_meeting',NULL,'',90000,'Booking kamu ditolak oleh admin. Silakan coba booking lagi dengan waktu atau konsultan yang berbeda.','2026-05-22 10:27:52','2026-05-22 10:28:01',NULL),(51,21,1,NULL,'2026-05-27','14:00:00',60,'video_meeting',NULL,'',90000,'Booking kamu ditolak oleh admin. Silakan coba booking lagi dengan waktu atau konsultan yang berbeda.','2026-05-22 10:41:22','2026-05-22 10:41:28',NULL),(52,21,1,NULL,'2026-05-25','10:00:00',60,'video_meeting',NULL,'',90000,'Booking kamu ditolak oleh admin. Silakan coba booking lagi dengan waktu atau konsultan yang berbeda.','2026-05-22 10:43:49','2026-05-22 10:43:56',NULL),(53,21,1,NULL,'2026-05-28','14:00:00',60,'video_meeting',NULL,'',90000,'Booking kamu ditolak oleh admin. Silakan coba booking lagi dengan waktu atau konsultan yang berbeda.','2026-05-22 10:50:50','2026-05-22 10:50:58',NULL),(54,21,1,NULL,'2026-05-29','11:00:00',60,'video_meeting',NULL,'',90000,'Booking kamu ditolak oleh admin. Silakan coba booking lagi dengan waktu atau konsultan yang berbeda.','2026-05-22 10:51:47','2026-05-22 10:52:00',NULL),(55,21,1,NULL,'2026-05-27','13:00:00',60,'video_meeting',NULL,'',90000,'Booking kamu ditolak oleh admin. Silakan coba booking lagi dengan waktu atau konsultan yang berbeda.','2026-05-22 10:54:03','2026-05-22 10:54:09',NULL),(56,21,1,NULL,'2026-05-24','11:00:00',60,'video_meeting',NULL,'rejected',90000,'Booking kamu ditolak oleh admin. Silakan coba booking lagi dengan waktu atau konsultan yang berbeda.','2026-05-22 11:02:40','2026-05-22 11:02:46','gopay'),(57,21,2,NULL,'2026-05-26','11:00:00',60,'video_meeting',NULL,'rejected',100000,'Booking kamu ditolak oleh admin. Silakan coba booking lagi dengan waktu atau konsultan yang berbeda.','2026-05-22 11:10:51','2026-05-22 11:10:58','transfer_bank'),(58,22,2,NULL,'2026-05-28','14:00:00',60,'chat',NULL,'booked',100000,NULL,'2026-05-22 11:24:56','2026-05-22 11:25:03','gopay'),(59,22,3,NULL,'2026-05-25','13:00:00',60,'video_meeting',NULL,'booked',95000,'https://zoom.us/j/4269415181','2026-05-22 11:25:44','2026-05-22 11:25:50','ovo'),(60,22,2,NULL,'2026-05-24','13:00:00',60,'video_meeting',NULL,'rejected',100000,'Booking kamu ditolak oleh admin. Silakan coba booking lagi dengan waktu atau konsultan yang berbeda.','2026-05-22 11:32:56','2026-05-22 11:33:04','qris'),(61,23,2,NULL,'2026-05-26','09:00:00',60,'video_meeting',NULL,'booked',100000,'https://zoom.us/j/2921378476','2026-05-25 06:23:02','2026-05-25 06:23:12','qris'),(62,23,2,NULL,'2026-05-26','10:00:00',60,'chat',NULL,'rejected',100000,'Booking kamu ditolak oleh admin. Silakan coba booking lagi dengan waktu atau konsultan yang berbeda.','2026-05-25 06:23:27','2026-05-25 06:23:36','ovo'),(63,23,3,NULL,'2026-05-28','10:00:00',60,'chat',NULL,'booked',95000,NULL,'2026-05-25 06:24:09','2026-05-25 06:24:16','transfer_bank');
/*!40000 ALTER TABLE `bookings` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `consultants`
--

DROP TABLE IF EXISTS `consultants`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `consultants` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(100) NOT NULL,
  `specialization` varchar(100) NOT NULL,
  `bio` text DEFAULT NULL,
  `photo_url` varchar(255) DEFAULT NULL,
  `rate` int(11) NOT NULL,
  `experience_years` int(11) DEFAULT 0,
  `rating` decimal(2,1) DEFAULT 0.0,
  `total_reviews` int(11) DEFAULT 0,
  `is_available` tinyint(1) DEFAULT 1,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `consultants`
--

LOCK TABLES `consultants` WRITE;
/*!40000 ALTER TABLE `consultants` DISABLE KEYS */;
INSERT INTO `consultants` VALUES (1,'Budi Finansial','Manajemen Utang','Ahli strategi keuangan digital.',NULL,90000,3,4.5,90,1,'2026-04-04 03:45:41'),(2,'Siska Amelia, CFA','Investasi & Tabungan','Membantu Anda membangun dana darurat dan mulai berinvestasi sejak dini dengan risiko terukur.',NULL,100000,3,5.0,150,1,'2026-04-05 07:28:42'),(3,'Yanto ','Manajemen Keuangan','Membantu Anda mengatur keuangan dengan metode 50/30/20 agar lebih terarah, mulai dari memenuhi kebutuhan, menikmati keinginan, hingga menabung dan berinvestasi secara seimbang sejak awal.',NULL,95000,3,4.8,100,1,'2026-04-05 07:28:42');
/*!40000 ALTER TABLE `consultants` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `daily_finance_logs`
--

DROP TABLE IF EXISTS `daily_finance_logs`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `daily_finance_logs` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `user_id` int(11) NOT NULL,
  `monthly_income` bigint(20) NOT NULL DEFAULT 0,
  `monthly_expenses` bigint(20) NOT NULL DEFAULT 0,
  `monthly_debt_payment` bigint(20) NOT NULL DEFAULT 0,
  `emergency_fund` bigint(20) NOT NULL DEFAULT 0,
  `debt_to_income_ratio` decimal(5,2) DEFAULT 0.00,
  `expense_to_income_ratio` decimal(5,2) DEFAULT 0.00,
  `emergency_fund_months` decimal(5,1) DEFAULT 0.0,
  `score` int(11) NOT NULL DEFAULT 0,
  `status` enum('Sehat','Rawan','Kritis') NOT NULL DEFAULT 'Kritis',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `user_id` (`user_id`),
  CONSTRAINT `daily_finance_logs_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=12 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `daily_finance_logs`
--

LOCK TABLES `daily_finance_logs` WRITE;
/*!40000 ALTER TABLE `daily_finance_logs` DISABLE KEYS */;
INSERT INTO `daily_finance_logs` VALUES (1,20,20000,2000,0,0,0.00,10.00,0.0,75,'Sehat','2026-05-22 04:23:52'),(2,20,30000,15000,2000,0,6.67,50.00,0.0,68,'Sehat','2026-05-22 04:24:28'),(3,20,20000,2000,0,0,0.00,10.00,0.0,75,'Sehat','2026-05-22 05:36:20'),(4,11,20000,2000,0,0,0.00,10.00,0.0,75,'Sehat','2026-05-22 06:44:36'),(5,21,20000,2000,1000,0,5.00,10.00,0.0,75,'Sehat','2026-05-22 07:03:54'),(6,22,50000,10000,5000,10000,10.00,20.00,1.0,85,'Sehat','2026-05-22 11:23:38'),(7,22,40000,10000,2000,0,5.00,25.00,0.0,75,'Sehat','2026-05-22 11:24:13'),(8,23,100000,50000,0,0,0.00,50.00,0.0,68,'Sehat','2026-05-25 06:19:02'),(9,24,120000,50000,0,0,0.00,41.67,0.0,75,'Sehat','2026-05-25 06:38:13'),(10,24,100000,50000,0,0,0.00,50.00,0.0,68,'Sehat','2026-05-25 07:01:03'),(11,24,180000,120000,0,0,0.00,66.67,0.0,61,'Rawan','2026-05-25 07:20:39');
/*!40000 ALTER TABLE `daily_finance_logs` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `financial_health_checks`
--

DROP TABLE IF EXISTS `financial_health_checks`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `financial_health_checks` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `user_id` int(11) NOT NULL,
  `monthly_income` bigint(20) NOT NULL,
  `monthly_expenses` bigint(20) NOT NULL,
  `monthly_debt_payment` bigint(20) NOT NULL,
  `total_debt` bigint(20) DEFAULT 0,
  `emergency_fund` bigint(20) DEFAULT 0,
  `debt_to_income_ratio` decimal(5,2) DEFAULT NULL,
  `expense_to_income_ratio` decimal(5,2) DEFAULT NULL,
  `emergency_fund_months` decimal(4,1) DEFAULT NULL,
  `status` enum('Sehat','Rawan','Kritis') NOT NULL,
  `score` int(11) NOT NULL,
  `recommendation` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `user_id` (`user_id`),
  CONSTRAINT `financial_health_checks_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=90 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `financial_health_checks`
--

LOCK TABLES `financial_health_checks` WRITE;
/*!40000 ALTER TABLE `financial_health_checks` DISABLE KEYS */;
INSERT INTO `financial_health_checks` VALUES (1,1,5000000,3000000,1500000,20000000,2000000,30.00,60.00,0.7,'Rawan',41,'Rasio cicilan utang Anda cukup tinggi (30-50%). Hindari menambah utang baru dan fokus melunasi cicilan yang ada.\n\nPengeluaran Anda terkendali dengan baik. Manfaatkan sisa pemasukan untuk investasi atau menabung.\n\nAnda belum memiliki dana darurat. Mulai sisihkan minimal 10% pemasukan setiap bulan.\n\nKondisi keuangan Anda dalam status RAWAN. Konsultasi dengan ahli keuangan dapat membantu mencegah kondisi yang memburuk.','2026-04-04 03:31:33'),(2,1,5000000,3000000,1500000,20000000,2000000,30.00,60.00,0.7,'Rawan',41,'Rasio cicilan utang Anda cukup tinggi (30-50%). Hindari menambah utang baru dan fokus melunasi cicilan yang ada.\n\nPengeluaran Anda terkendali dengan baik. Manfaatkan sisa pemasukan untuk investasi atau menabung.\n\nAnda belum memiliki dana darurat. Mulai sisihkan minimal 10% pemasukan setiap bulan.\n\nKondisi keuangan Anda dalam status RAWAN. Konsultasi dengan ahli keuangan dapat membantu mencegah kondisi yang memburuk.','2026-04-04 03:40:02'),(3,5,100,10,3,0,0,3.00,10.00,0.0,'Sehat',75,'Rasio cicilan utang Anda masih dalam batas aman. Pertahankan kebiasaan ini.\n\nPengeluaran Anda terkendali dengan baik. Manfaatkan sisa pemasukan untuk investasi atau menabung.\n\nAnda belum memiliki dana darurat. Mulai sisihkan minimal 10% pemasukan setiap bulan.','2026-04-09 10:00:07'),(4,5,200,20,10,3,0,5.00,10.00,0.0,'Sehat',75,'Rasio cicilan utang Anda masih dalam batas aman. Pertahankan kebiasaan ini.\n\nPengeluaran Anda terkendali dengan baik. Manfaatkan sisa pemasukan untuk investasi atau menabung.\n\nAnda belum memiliki dana darurat. Mulai sisihkan minimal 10% pemasukan setiap bulan.','2026-04-09 12:56:08'),(33,11,1000000,10000000,10000000,0,0,999.99,999.99,0.0,'Kritis',0,'Cicilan utang Anda melebihi 50% pemasukan. Segera konsultasikan dengan ahli keuangan untuk restrukturisasi utang.\n\nPengeluaran Anda hampir menyamai pemasukan. Segera kurangi pengeluaran tidak esensial.\n\nAnda belum memiliki dana darurat. Mulai sisihkan minimal 10% pemasukan setiap bulan.\n\nKondisi keuangan Anda dalam status KRITIS. Segera berkonsultasi dengan konsultan keuangan profesional kami.','2026-04-19 02:22:57'),(55,18,1000000,10000000,8000000,0,0,800.00,999.99,0.0,'Kritis',0,'Cicilan utang Anda melebihi 50% pemasukan. Segera konsultasikan dengan ahli keuangan untuk restrukturisasi utang.\n\nPengeluaran Anda hampir menyamai pemasukan. Segera kurangi pengeluaran tidak esensial.\n\nAnda belum memiliki dana darurat. Mulai sisihkan minimal 10% pemasukan setiap bulan.\n\nKondisi keuangan Anda dalam status KRITIS. Segera berkonsultasi dengan konsultan keuangan profesional kami.','2026-05-06 01:27:37'),(56,18,20000000,5200000,0,0,20000000,0.00,26.00,3.8,'Sehat',93,'Rasio cicilan utang Anda masih dalam batas aman. Pertahankan kebiasaan ini.\n\nPengeluaran Anda terkendali dengan baik. Manfaatkan sisa pemasukan untuk investasi atau menabung.\n\nDana darurat Anda cukup untuk 3.8 bulan. Pertimbangkan untuk meningkatkan hingga 6 bulan.','2026-05-06 01:29:06'),(57,18,5000000,1000000,1000000,0,0,20.00,20.00,0.0,'Sehat',67,'Rasio cicilan utang Anda masih dalam batas aman. Pertahankan kebiasaan ini.\n\nPengeluaran Anda terkendali dengan baik. Manfaatkan sisa pemasukan untuk investasi atau menabung.\n\nAnda belum memiliki dana darurat. Mulai sisihkan minimal 10% pemasukan setiap bulan.','2026-05-06 09:57:19'),(70,11,300000,150000,0,0,0,0.00,50.00,0.0,'Sehat',68,'Rasio cicilan utang Anda masih dalam batas aman. Pertahankan kebiasaan ini.\n\nPengeluaran Anda terkendali dengan baik. Manfaatkan sisa pemasukan untuk investasi atau menabung.\n\nAnda belum memiliki dana darurat. Mulai sisihkan minimal 10% pemasukan setiap bulan.','2026-05-14 16:31:15'),(71,11,400000,80000,40000,0,100000,10.00,20.00,1.3,'Sehat',85,'Rasio cicilan utang Anda masih dalam batas aman. Pertahankan kebiasaan ini.\n\nPengeluaran Anda terkendali dengan baik. Manfaatkan sisa pemasukan untuk investasi atau menabung.\n\nDana darurat Anda baru cukup untuk 1.3 bulan. Target minimal adalah 3 bulan pengeluaran.','2026-05-15 03:44:44'),(72,11,400000,80000,20000,0,100000,5.00,20.00,1.3,'Sehat',85,'Rasio cicilan utang Anda masih dalam batas aman. Pertahankan kebiasaan ini.\n\nPengeluaran Anda terkendali dengan baik. Manfaatkan sisa pemasukan untuk investasi atau menabung.\n\nDana darurat Anda baru cukup untuk 1.3 bulan. Target minimal adalah 3 bulan pengeluaran.','2026-05-15 09:26:12'),(73,11,600000,90000,30000,0,0,5.00,15.00,0.0,'Sehat',75,'Rasio cicilan utang Anda masih dalam batas aman. Pertahankan kebiasaan ini.\n\nPengeluaran Anda terkendali dengan baik. Manfaatkan sisa pemasukan untuk investasi atau menabung.\n\nAnda belum memiliki dana darurat. Mulai sisihkan minimal 10% pemasukan setiap bulan.','2026-05-21 13:26:46'),(74,11,600000,60000,0,0,0,0.00,10.00,0.0,'Sehat',75,'Rasio cicilan utang Anda masih dalam batas aman. Pertahankan kebiasaan ini.\n\nPengeluaran Anda terkendali dengan baik. Manfaatkan sisa pemasukan untuk investasi atau menabung.\n\nAnda belum memiliki dana darurat. Mulai sisihkan minimal 10% pemasukan setiap bulan.','2026-05-21 13:32:22'),(75,11,600000,60000,0,0,0,0.00,10.00,0.0,'Sehat',75,'Rasio cicilan utang Anda masih dalam batas aman. Pertahankan kebiasaan ini.\n\nPengeluaran Anda terkendali dengan baik. Manfaatkan sisa pemasukan untuk investasi atau menabung.\n\nAnda belum memiliki dana darurat. Mulai sisihkan minimal 10% pemasukan setiap bulan.','2026-05-21 13:35:45'),(76,11,20000,2000,0,0,0,0.00,10.00,0.0,'Sehat',75,'Rasio cicilan utang Anda masih dalam batas aman. Pertahankan kebiasaan ini.\n\nPengeluaran Anda terkendali dengan baik. Manfaatkan sisa pemasukan untuk investasi atau menabung.\n\nAnda belum memiliki dana darurat. Mulai sisihkan minimal 10% pemasukan setiap bulan.','2026-05-21 13:38:05'),(77,11,2000000,1000000,0,0,0,0.00,50.00,0.0,'Sehat',68,'Rasio cicilan utang Anda masih dalam batas aman. Pertahankan kebiasaan ini.\n\nPengeluaran Anda terkendali dengan baik. Manfaatkan sisa pemasukan untuk investasi atau menabung.\n\nAnda belum memiliki dana darurat. Mulai sisihkan minimal 10% pemasukan setiap bulan.','2026-05-21 13:38:19'),(78,11,600000,150000,0,0,0,0.00,25.00,0.0,'Sehat',75,'Rasio cicilan utang Anda masih dalam batas aman. Pertahankan kebiasaan ini.\n\nPengeluaran Anda terkendali dengan baik. Manfaatkan sisa pemasukan untuk investasi atau menabung.\n\nAnda belum memiliki dana darurat. Mulai sisihkan minimal 10% pemasukan setiap bulan.','2026-05-21 13:43:06'),(79,11,600000,60000,0,0,0,0.00,10.00,0.0,'Sehat',75,'Rasio cicilan utang Anda masih dalam batas aman. Pertahankan kebiasaan ini.\n\nPengeluaran Anda terkendali dengan baik. Manfaatkan sisa pemasukan untuk investasi atau menabung.\n\nAnda belum memiliki dana darurat. Mulai sisihkan minimal 10% pemasukan setiap bulan.','2026-05-21 13:47:19'),(80,11,600000,30000,0,0,0,0.00,5.00,0.0,'Sehat',75,'Rasio cicilan utang Anda masih dalam batas aman. Pertahankan kebiasaan ini.\n\nPengeluaran Anda terkendali dengan baik. Manfaatkan sisa pemasukan untuk investasi atau menabung.\n\nAnda belum memiliki dana darurat. Mulai sisihkan minimal 10% pemasukan setiap bulan.','2026-05-21 13:51:21'),(81,11,600000,60000,0,0,0,0.00,10.00,0.0,'Sehat',75,'Rasio cicilan utang Anda masih dalam batas aman. Pertahankan kebiasaan ini.\n\nPengeluaran Anda terkendali dengan baik. Manfaatkan sisa pemasukan untuk investasi atau menabung.\n\nAnda belum memiliki dana darurat. Mulai sisihkan minimal 10% pemasukan setiap bulan.','2026-05-21 13:51:33'),(82,11,600000,60000,0,0,0,0.00,10.00,0.0,'Sehat',75,'Rasio cicilan utang Anda masih dalam batas aman. Pertahankan kebiasaan ini.\n\nPengeluaran Anda terkendali dengan baik. Manfaatkan sisa pemasukan untuk investasi atau menabung.\n\nAnda belum memiliki dana darurat. Mulai sisihkan minimal 10% pemasukan setiap bulan.','2026-05-21 13:54:48'),(83,20,600000,60000,0,0,0,0.00,10.00,0.0,'Sehat',75,'Rasio cicilan utang Anda masih dalam batas aman. Pertahankan kebiasaan ini.\n\nPengeluaran Anda terkendali dengan baik. Manfaatkan sisa pemasukan untuk investasi atau menabung.\n\nAnda belum memiliki dana darurat. Mulai sisihkan minimal 10% pemasukan setiap bulan.','2026-05-21 14:04:39'),(84,21,20000,2000,1000,0,0,5.00,10.00,0.0,'Sehat',75,'Rasio cicilan utang Anda masih dalam batas aman. Pertahankan kebiasaan ini.\n\nPengeluaran Anda terkendali dengan baik. Manfaatkan sisa pemasukan untuk investasi atau menabung.\n\nAnda belum memiliki dana darurat. Mulai sisihkan minimal 10% pemasukan setiap bulan.','2026-05-22 07:04:00'),(85,22,90000,20000,7000,0,10000,7.78,22.22,0.5,'Sehat',75,'Rasio cicilan utang Anda masih dalam batas aman. Pertahankan kebiasaan ini.\n\nPengeluaran Anda terkendali dengan baik. Manfaatkan sisa pemasukan untuk investasi atau menabung.\n\nAnda belum memiliki dana darurat. Mulai sisihkan minimal 10% pemasukan setiap bulan.','2026-05-22 11:24:23'),(86,23,100000,50000,0,0,0,0.00,50.00,0.0,'Sehat',68,'Rasio cicilan utang Anda masih dalam batas aman. Pertahankan kebiasaan ini.\n\nPengeluaran Anda terkendali dengan baik. Manfaatkan sisa pemasukan untuk investasi atau menabung.\n\nAnda belum memiliki dana darurat. Mulai sisihkan minimal 10% pemasukan setiap bulan.','2026-05-25 06:22:50'),(87,24,100000,50000,0,0,0,0.00,50.00,0.0,'Sehat',68,'Rasio cicilan utang Anda masih dalam batas aman. Pertahankan kebiasaan ini.\n\nPengeluaran Anda terkendali dengan baik. Manfaatkan sisa pemasukan untuk investasi atau menabung.\n\nAnda belum memiliki dana darurat. Mulai sisihkan minimal 10% pemasukan setiap bulan.','2026-05-25 06:37:04'),(88,24,220000,100000,0,0,0,0.00,45.45,0.0,'Sehat',75,'Rasio cicilan utang Anda masih dalam batas aman. Pertahankan kebiasaan ini.\n\nPengeluaran Anda terkendali dengan baik. Manfaatkan sisa pemasukan untuk investasi atau menabung.\n\nAnda belum memiliki dana darurat. Mulai sisihkan minimal 10% pemasukan setiap bulan.','2026-05-25 07:15:32'),(89,24,400000,220000,0,0,0,0.00,55.00,0.0,'Sehat',68,'Rasio cicilan utang Anda masih dalam batas aman. Pertahankan kebiasaan ini.\n\nPengeluaran Anda terkendali dengan baik. Manfaatkan sisa pemasukan untuk investasi atau menabung.\n\nAnda belum memiliki dana darurat. Mulai sisihkan minimal 10% pemasukan setiap bulan.','2026-05-25 07:21:44');
/*!40000 ALTER TABLE `financial_health_checks` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `users`
--

DROP TABLE IF EXISTS `users`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `users` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(100) NOT NULL,
  `email` varchar(100) NOT NULL,
  `password` varchar(255) NOT NULL,
  `phone` varchar(20) DEFAULT NULL,
  `photo_url` varchar(255) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `role` varchar(20) DEFAULT 'member',
  PRIMARY KEY (`id`),
  UNIQUE KEY `email` (`email`)
) ENGINE=InnoDB AUTO_INCREMENT=25 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `users`
--

LOCK TABLES `users` WRITE;
/*!40000 ALTER TABLE `users` DISABLE KEYS */;
INSERT INTO `users` VALUES (1,'nama kamu','email@example.com','$2b$12$PAnwEoS.CG7s2uO.LpkCquvQ95qfrcFaSrqTmkcLKqYnDZ/s1/Jeu','081234567890',NULL,'2026-04-04 03:07:27','2026-04-04 03:07:27','member'),(5,'buditest123','budi@gmail.com','$2b$12$DftVw.BNZAby05Mb0eqeiOKL7jWqOVHA1/OfI1qcRpw0uHHSnGW9i',NULL,NULL,'2026-04-06 13:30:16','2026-04-06 13:30:16','member'),(11,'dani','dani@gmail.com','$2b$12$wGQyD2PMpBU2EHxNrNGN6e3Q5EvXO.eHmBdM1ZWuUq0MuiRlUfexC',NULL,NULL,'2026-04-19 01:46:06','2026-04-21 11:25:46','member'),(18,'ambon','ambon@gmail.com','$2b$12$WcsmoO7oGZDdm97q.SUkBOlwt5U0xyUq2gdYK/o5Di98gbUB/nje6',NULL,NULL,'2026-05-06 01:25:34','2026-05-06 01:25:34','member'),(20,'baru','baru@gmail.com','$2b$12$JFmx9KH052t3UkDHrYfKV.2D/I0tDZtphu1YocRlZFW9VwbyP8rOS',NULL,NULL,'2026-05-21 14:04:14','2026-05-21 14:04:14','member'),(21,'new','new@gmail.com','$2b$12$jXmXlxhlf6cBdQCXAfB9kukK42u3XjHl9Xf/q.kOQvmoCWjDaNN52',NULL,NULL,'2026-05-22 07:03:25','2026-05-22 07:03:25','member'),(22,'bata','bata@gmail.com','$2b$12$NMjVAIDELLsyQ1MCXrwyfuECE0xsQzhsWF8jxhoMuVSKQ9YGS./XS',NULL,NULL,'2026-05-22 11:22:37','2026-05-22 11:22:37','member'),(23,'tes','tes@gmail.com','$2b$12$8tGmMeA6PVIpxiav01k3oOivT1aZj0FSGxaMjuQ.8EBEnoU2T7O6W',NULL,NULL,'2026-05-25 05:43:47','2026-05-25 05:43:47','member'),(24,'abdal','abdal@gmail.com','$2b$12$zb.vdyjVsq.ADPAyXKZTwOwFqKRKs/SmTCMT33ZXki9P72RhCn.j2',NULL,NULL,'2026-05-25 06:25:26','2026-05-25 06:25:26','member');
/*!40000 ALTER TABLE `users` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-05-25 20:44:07
