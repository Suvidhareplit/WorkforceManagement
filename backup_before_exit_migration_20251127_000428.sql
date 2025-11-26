-- MySQL dump 10.13  Distrib 8.4.5, for macos14.7 (x86_64)
--
-- Host: localhost    Database: hrms_db
-- ------------------------------------------------------
-- Server version	9.3.0

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `attachment_templates`
--

DROP TABLE IF EXISTS `attachment_templates`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `attachment_templates` (
  `id` int NOT NULL AUTO_INCREMENT,
  `entity_type` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'Which module this template is for',
  `template_name` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'Display name: "Medical Certificate", "Resume", etc.',
  `template_code` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'Unique code: MEDICAL_CERT, RESUME, AADHAR, etc.',
  `category` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'Default category',
  `subcategory` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'Default subcategory',
  `is_required` tinyint(1) DEFAULT '0' COMMENT 'Is this attachment mandatory?',
  `max_file_size_mb` int DEFAULT '10' COMMENT 'Maximum file size in MB',
  `allowed_extensions` json DEFAULT NULL COMMENT 'Allowed file types: [".pdf", ".jpg"]',
  `icon` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'Icon name for UI',
  `color` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'Color code for UI',
  `help_text` text COLLATE utf8mb4_unicode_ci COMMENT 'Instructions for user',
  `is_active` tinyint(1) DEFAULT '1',
  `display_order` int DEFAULT '0',
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_template` (`entity_type`,`template_code`),
  KEY `idx_entity_type` (`entity_type`),
  KEY `idx_is_active` (`is_active`)
) ENGINE=InnoDB AUTO_INCREMENT=22 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Pre-defined attachment templates for consistent categorization';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `attachment_templates`
--

LOCK TABLES `attachment_templates` WRITE;
/*!40000 ALTER TABLE `attachment_templates` DISABLE KEYS */;
INSERT INTO `attachment_templates` VALUES (1,'LEAVE_APPLICATION','Medical Certificate','MEDICAL_CERT','DOCUMENT','MEDICAL_CERTIFICATE',1,10,'[\".pdf\", \".jpg\", \".png\"]','FileHeart','red','Upload medical certificate for sick leave (PDF or image)',1,0,'2025-11-12 12:21:58','2025-11-12 12:21:58'),(2,'LEAVE_APPLICATION','Supporting Document','SUPPORTING_DOC','DOCUMENT','SUPPORTING_DOCUMENT',0,10,'[\".pdf\", \".doc\", \".docx\"]','FileText','blue','Any additional supporting documents',1,0,'2025-11-12 12:21:58','2025-11-12 12:21:58'),(3,'EMPLOYEE','Aadhar Card','AADHAR','CERTIFICATE','IDENTITY_PROOF',1,10,'[\".pdf\", \".jpg\", \".png\"]','CreditCard','orange','Upload Aadhar card (both sides)',1,0,'2025-11-12 12:21:58','2025-11-12 12:21:58'),(4,'EMPLOYEE','PAN Card','PAN','CERTIFICATE','IDENTITY_PROOF',1,10,'[\".pdf\", \".jpg\", \".png\"]','CreditCard','purple','Upload PAN card',1,0,'2025-11-12 12:21:58','2025-11-12 12:21:58'),(5,'EMPLOYEE','Passport Photo','PHOTO','PHOTO','PROFILE_PHOTO',1,10,'[\".jpg\", \".jpeg\", \".png\"]','User','blue','Upload passport-size photo (max 2MB)',1,0,'2025-11-12 12:21:58','2025-11-12 12:21:58'),(6,'EMPLOYEE','Resume/CV','RESUME','DOCUMENT','RESUME',0,10,'[\".pdf\", \".doc\", \".docx\"]','FileText','green','Upload latest resume',1,0,'2025-11-12 12:21:58','2025-11-12 12:21:58'),(7,'EMPLOYEE','Offer Letter','OFFER_LETTER','DOCUMENT','OFFER_LETTER',1,10,'[\".pdf\"]','FileSignature','indigo','Signed offer letter',1,0,'2025-11-12 12:21:58','2025-11-12 12:21:58'),(8,'EMPLOYEE','Joining Letter','JOINING_LETTER','DOCUMENT','JOINING_LETTER',1,10,'[\".pdf\"]','FileCheck','green','Signed joining letter',1,0,'2025-11-12 12:21:58','2025-11-12 12:21:58'),(9,'EMPLOYEE','10th Certificate','TENTH_CERT','CERTIFICATE','EDUCATION',0,10,'[\".pdf\", \".jpg\"]','GraduationCap','blue','Upload 10th standard certificate',1,0,'2025-11-12 12:21:58','2025-11-12 12:21:58'),(10,'EMPLOYEE','12th Certificate','TWELFTH_CERT','CERTIFICATE','EDUCATION',0,10,'[\".pdf\", \".jpg\"]','GraduationCap','blue','Upload 12th standard certificate',1,0,'2025-11-12 12:21:58','2025-11-12 12:21:58'),(11,'EMPLOYEE','Degree Certificate','DEGREE_CERT','CERTIFICATE','EDUCATION',1,10,'[\".pdf\", \".jpg\"]','GraduationCap','purple','Upload degree/diploma certificate',1,0,'2025-11-12 12:21:58','2025-11-12 12:21:58'),(12,'EMPLOYEE','Experience Letter','EXPERIENCE_LETTER','DOCUMENT','EXPERIENCE',0,10,'[\".pdf\"]','Briefcase','teal','Previous company experience letter',1,0,'2025-11-12 12:21:58','2025-11-12 12:21:58'),(13,'EMPLOYEE','Relieving Letter','RELIEVING_LETTER','DOCUMENT','EXPERIENCE',0,10,'[\".pdf\"]','FileX','gray','Previous company relieving letter',1,0,'2025-11-12 12:21:58','2025-11-12 12:21:58'),(14,'EMPLOYEE','Payslip','PAYSLIP','DOCUMENT','SALARY',0,10,'[\".pdf\"]','DollarSign','green','Last 3 months payslips',1,0,'2025-11-12 12:21:58','2025-11-12 12:21:58'),(15,'HIRING','Resume','RESUME','DOCUMENT','RESUME',1,10,'[\".pdf\", \".doc\", \".docx\"]','FileText','blue','Candidate resume',1,0,'2025-11-12 12:21:58','2025-11-12 12:21:58'),(16,'HIRING','Cover Letter','COVER_LETTER','DOCUMENT','COVER_LETTER',0,10,'[\".pdf\", \".doc\", \".docx\"]','Mail','purple','Cover letter from candidate',1,0,'2025-11-12 12:21:58','2025-11-12 12:21:58'),(17,'TRAINING','Certificate','TRAINING_CERT','CERTIFICATE','TRAINING_CERTIFICATE',0,10,'[\".pdf\", \".jpg\"]','Award','yellow','Training completion certificate',1,0,'2025-11-12 12:21:58','2025-11-12 12:21:58'),(18,'TRAINING','Course Material','COURSE_MATERIAL','DOCUMENT','TRAINING_MATERIAL',0,10,'[\".pdf\", \".ppt\", \".pptx\"]','BookOpen','blue','Training course materials',1,0,'2025-11-12 12:21:58','2025-11-12 12:21:58'),(19,'VENDOR','GST Certificate','GST_CERT','CERTIFICATE','GST',1,10,'[\".pdf\"]','FileSpreadsheet','green','GST registration certificate',1,0,'2025-11-12 12:21:58','2025-11-12 12:21:58'),(20,'VENDOR','PAN Card','VENDOR_PAN','CERTIFICATE','PAN',1,10,'[\".pdf\", \".jpg\"]','CreditCard','purple','Vendor PAN card',1,0,'2025-11-12 12:21:58','2025-11-12 12:21:58'),(21,'VENDOR','Agreement','AGREEMENT','DOCUMENT','CONTRACT',0,10,'[\".pdf\"]','FileSignature','red','Vendor agreement/contract',1,0,'2025-11-12 12:21:58','2025-11-12 12:21:58');
/*!40000 ALTER TABLE `attachment_templates` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `attachments`
--

DROP TABLE IF EXISTS `attachments`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `attachments` (
  `id` int NOT NULL AUTO_INCREMENT,
  `entity_type` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'LEAVE_APPLICATION, EMPLOYEE, HIRING, ONBOARDING, TRAINING, VENDOR, etc.',
  `entity_id` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'ID of the related entity (can be INT or UUID as string)',
  `employee_id` int DEFAULT NULL COMMENT 'Employee who owns this attachment (nullable for system uploads)',
  `user_id` int DEFAULT NULL COMMENT 'User who uploaded (can differ from employee_id)',
  `file_name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'Original file name',
  `file_key` varchar(500) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'S3 file key/path',
  `file_url` varchar(1000) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'Full S3 URL (optional, can be regenerated)',
  `file_size` int NOT NULL COMMENT 'File size in bytes',
  `file_type` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'MIME type (e.g., application/pdf)',
  `file_extension` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'File extension (.pdf, .jpg, etc.)',
  `attachment_category` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'DOCUMENT, CERTIFICATE, RESUME, PHOTO, OTHER',
  `attachment_subcategory` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'Specific type: MEDICAL_CERT, OFFER_LETTER, AADHAR, PAN, etc.',
  `title` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'Custom title for the attachment',
  `description` text COLLATE utf8mb4_unicode_ci COMMENT 'Optional description',
  `tags` json DEFAULT NULL COMMENT 'Array of tags: ["urgent", "verified", "confidential"]',
  `s3_bucket` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'S3 bucket name',
  `s3_region` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'S3 region',
  `status` enum('PENDING','VERIFIED','REJECTED','ARCHIVED') COLLATE utf8mb4_unicode_ci DEFAULT 'PENDING',
  `is_active` tinyint(1) DEFAULT '1' COMMENT 'Soft delete flag',
  `is_verified` tinyint(1) DEFAULT '0' COMMENT 'Admin verified the document',
  `verified_by` int DEFAULT NULL COMMENT 'User who verified',
  `verified_at` datetime DEFAULT NULL COMMENT 'Verification timestamp',
  `rejection_reason` text COLLATE utf8mb4_unicode_ci COMMENT 'Why document was rejected',
  `is_confidential` tinyint(1) DEFAULT '0' COMMENT 'Requires special permission to view',
  `is_public` tinyint(1) DEFAULT '0' COMMENT 'Can be viewed by everyone',
  `allowed_roles` json DEFAULT NULL COMMENT 'Array of roles that can access: ["admin", "hr", "manager"]',
  `expires_at` datetime DEFAULT NULL COMMENT 'Document expiration date (e.g., certificates)',
  `uploaded_by` int NOT NULL COMMENT 'User who uploaded',
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `deleted_at` datetime DEFAULT NULL COMMENT 'Soft delete timestamp',
  `deleted_by` int DEFAULT NULL COMMENT 'User who deleted',
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_file_key` (`file_key`),
  KEY `idx_entity` (`entity_type`,`entity_id`),
  KEY `idx_employee` (`employee_id`),
  KEY `idx_user` (`user_id`),
  KEY `idx_category` (`attachment_category`),
  KEY `idx_subcategory` (`attachment_subcategory`),
  KEY `idx_status` (`status`),
  KEY `idx_is_active` (`is_active`),
  KEY `idx_created_at` (`created_at`),
  KEY `idx_expires_at` (`expires_at`),
  KEY `idx_entity_active` (`entity_type`,`entity_id`,`is_active`),
  KEY `idx_employee_active` (`employee_id`,`is_active`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Generic attachments table for all modules in the project';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `attachments`
--

LOCK TABLES `attachments` WRITE;
/*!40000 ALTER TABLE `attachments` DISABLE KEYS */;
/*!40000 ALTER TABLE `attachments` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `business_units`
--

DROP TABLE IF EXISTS `business_units`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `business_units` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `code` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `is_active` tinyint(1) DEFAULT '1',
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `code` (`code`),
  UNIQUE KEY `code_2` (`code`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `business_units`
--

LOCK TABLES `business_units` WRITE;
/*!40000 ALTER TABLE `business_units` DISABLE KEYS */;
INSERT INTO `business_units` VALUES (1,'Yulu Mobility','YM',1,'2025-10-23 00:25:22'),(2,'Yumove','YMV',1,'2025-10-30 15:06:48');
/*!40000 ALTER TABLE `business_units` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `candidates`
--

DROP TABLE IF EXISTS `candidates`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `candidates` (
  `id` int NOT NULL AUTO_INCREMENT,
  `application_id` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `name` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `email` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `phone` varchar(15) COLLATE utf8mb4_unicode_ci NOT NULL,
  `aadhar_number` varchar(12) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `role_id` int DEFAULT NULL,
  `role_name` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `city_id` int DEFAULT NULL,
  `city_name` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `cluster_id` int DEFAULT NULL,
  `cluster_name` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `qualification` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `resume_source` enum('vendor','field_recruiter','referral') COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `vendor_id` int DEFAULT NULL,
  `vendor_name` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `recruiter_id` int DEFAULT NULL,
  `recruiter_name` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `referral_name` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `experience_years` decimal(3,1) DEFAULT NULL,
  `current_company` text COLLATE utf8mb4_unicode_ci,
  `current_ctc` decimal(10,2) DEFAULT NULL,
  `expected_ctc` decimal(10,2) DEFAULT NULL,
  `resume_url` text COLLATE utf8mb4_unicode_ci,
  `status` enum('applied','prescreening','technical','selected','rejected','offered','joined','assigned_induction','onboarded','employee_created') COLLATE utf8mb4_unicode_ci DEFAULT 'applied',
  `prescreening_score` int DEFAULT NULL,
  `prescreening_result` enum('pass','fail','pending') COLLATE utf8mb4_unicode_ci DEFAULT 'pending',
  `prescreening_date` datetime DEFAULT NULL,
  `prescreening_notes` text COLLATE utf8mb4_unicode_ci,
  `technical_result` enum('selected','rejected','pending') COLLATE utf8mb4_unicode_ci DEFAULT 'pending',
  `technical_date` datetime DEFAULT NULL,
  `technical_notes` text COLLATE utf8mb4_unicode_ci,
  `interview_notes` text COLLATE utf8mb4_unicode_ci,
  `interview_feedback` text COLLATE utf8mb4_unicode_ci,
  `offered_salary` decimal(10,2) DEFAULT NULL,
  `joining_date` date DEFAULT NULL,
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `application_id` (`application_id`),
  UNIQUE KEY `aadhar_number` (`aadhar_number`),
  KEY `idx_candidates_status` (`status`)
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `candidates`
--

LOCK TABLES `candidates` WRITE;
/*!40000 ALTER TABLE `candidates` DISABLE KEYS */;
INSERT INTO `candidates` VALUES (5,'BLR_IND_WT_SAG_0002','sagar K M','kmsagar515@gmail.com','7411889572','742482467235',3,'Workshop Technician',1,'Bangalore',3,'Indiranagar','11th-12th','vendor',7,'Xpheno',NULL,NULL,NULL,2.0,'Zypp',20000.00,21000.00,NULL,'employee_created',8,'pass','2025-10-30 22:42:16','Good communication skills, passed prescreening','selected','2025-10-30 23:08:14','Test notes',NULL,NULL,26000.00,'2025-10-29','2025-10-30 21:19:00','2025-11-19 05:04:57'),(6,'BLR_IND_WT_AVI_0001','Avinash','avinash.b@gmail.com','7411889573','742482467236',3,'Workshop Technician',1,'Bangalore',3,'Indiranagar','ITI','field_recruiter',NULL,NULL,1,'Joydeep',NULL,1.0,'Zypp',20000.00,24000.00,NULL,'rejected',9,'pass','2025-11-07 03:21:17','','rejected','2025-11-07 03:21:23','N/A',NULL,NULL,24000.00,'2025-11-07','2025-11-07 08:51:04','2025-11-19 02:49:48');
/*!40000 ALTER TABLE `candidates` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `cities`
--

DROP TABLE IF EXISTS `cities`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `cities` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `code` varchar(10) COLLATE utf8mb4_unicode_ci NOT NULL,
  `is_active` tinyint(1) DEFAULT '1',
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `code` (`code`)
) ENGINE=InnoDB AUTO_INCREMENT=9 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `cities`
--

LOCK TABLES `cities` WRITE;
/*!40000 ALTER TABLE `cities` DISABLE KEYS */;
INSERT INTO `cities` VALUES (1,'Bangalore','BLR',1,'2025-10-22 22:51:34'),(2,'Mumbai','MUM',1,'2025-10-22 22:51:34'),(3,'Delhi','DEL',1,'2025-10-22 22:51:34'),(4,'Hyderabad','HYD',1,'2025-10-22 22:51:34'),(5,'Chennai','CHE',1,'2025-10-22 22:51:34'),(6,'Pune','PUN',1,'2025-10-22 22:51:34'),(7,'Kolkata','KOL',1,'2025-10-22 22:51:34');
/*!40000 ALTER TABLE `cities` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `classroom_training`
--

DROP TABLE IF EXISTS `classroom_training`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `classroom_training` (
  `id` int NOT NULL AUTO_INCREMENT,
  `induction_id` int NOT NULL,
  `candidate_id` int NOT NULL,
  `training_start_date` date DEFAULT NULL,
  `training_completion_date` date DEFAULT NULL,
  `trainer_id` int DEFAULT NULL,
  `crt_feedback` enum('fit','not_fit_crt_rejection','early_exit','fit_need_observation') COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `remarks` text COLLATE utf8mb4_unicode_ci,
  `last_working_day` date DEFAULT NULL,
  `exit_date` date DEFAULT NULL,
  `exit_reason` enum('crt_absconding') COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `induction_id` (`induction_id`),
  KEY `candidate_id` (`candidate_id`),
  KEY `trainer_id` (`trainer_id`),
  CONSTRAINT `classroom_training_ibfk_1` FOREIGN KEY (`induction_id`) REFERENCES `induction_training` (`id`) ON DELETE CASCADE,
  CONSTRAINT `classroom_training_ibfk_2` FOREIGN KEY (`candidate_id`) REFERENCES `candidates` (`id`) ON DELETE CASCADE,
  CONSTRAINT `classroom_training_ibfk_3` FOREIGN KEY (`trainer_id`) REFERENCES `trainers` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `classroom_training`
--

LOCK TABLES `classroom_training` WRITE;
/*!40000 ALTER TABLE `classroom_training` DISABLE KEYS */;
INSERT INTO `classroom_training` VALUES (2,1,5,'2025-11-04','2025-11-04',3,'fit',NULL,NULL,NULL,NULL,'2025-11-07 09:56:24','2025-11-07 10:12:47');
/*!40000 ALTER TABLE `classroom_training` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `clusters`
--

DROP TABLE IF EXISTS `clusters`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `clusters` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `code` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `city_id` int DEFAULT NULL,
  `is_active` tinyint(1) DEFAULT '1',
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `code` (`code`),
  UNIQUE KEY `code_2` (`code`),
  KEY `city_id` (`city_id`),
  CONSTRAINT `clusters_ibfk_1` FOREIGN KEY (`city_id`) REFERENCES `cities` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB AUTO_INCREMENT=35 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `clusters`
--

LOCK TABLES `clusters` WRITE;
/*!40000 ALTER TABLE `clusters` DISABLE KEYS */;
INSERT INTO `clusters` VALUES (1,'HQ_YULU PTP','HQ',1,1,'2025-10-22 22:54:23'),(2,'Carmeleram','ORR',1,1,'2025-10-22 23:43:02'),(3,'Indiranagar','IND',1,1,'2025-10-22 23:43:19'),(4,'Whitefield','WF',1,1,'2025-10-22 23:43:30'),(5,'Central Bangalore Division','CBD',1,1,'2025-10-22 23:43:58'),(6,'Hebbal','HBL',1,1,'2025-10-22 23:44:17'),(7,'Yelahanka','YEL',1,1,'2025-10-22 23:44:24'),(8,'Koramangala','KOR',1,1,'2025-10-22 23:44:32'),(9,'Jayanagar','JYN',1,1,'2025-10-22 23:45:01'),(10,'Electronic City','E-CITY',1,1,'2025-10-22 23:45:17'),(11,'GURGAON','GGN',3,1,'2025-10-22 23:45:32'),(12,'Faridabad','FBD',3,1,'2025-10-22 23:45:42'),(13,'Noida','NOI',3,1,'2025-10-22 23:45:56'),(14,'Ghaziabad','GZD',3,1,'2025-10-22 23:46:25'),(15,'Central Delhi','CD',3,1,'2025-10-22 23:47:05'),(16,'North Delhi','ND',3,1,'2025-10-22 23:47:16'),(17,'South Delhi','SD',3,1,'2025-10-22 23:47:28'),(18,'Dwarka','DWR',3,1,'2025-10-22 23:47:44'),(19,'Laxminagar','LXM',3,1,'2025-10-22 23:48:11'),(20,'Bandra','BKC',2,1,'2025-10-22 23:48:21'),(21,'South Bombay','SOBO',2,1,'2025-10-22 23:48:34'),(22,'Andheri','ANR',2,1,'2025-10-22 23:49:03'),(23,'Navi Mumbai','NM',2,1,'2025-10-22 23:49:15'),(24,'Chembur','CHM',2,1,'2025-10-22 23:49:24'),(25,'Powai','POW',2,1,'2025-10-22 23:49:42'),(26,'Malad','MLD',2,1,'2025-10-22 23:50:20'),(27,'Thane','THN',2,1,'2025-10-22 23:51:12'),(28,'Cyberabad','CYD',4,1,'2025-10-22 23:51:33'),(29,'Mumbai Office','MO',2,1,'2025-10-22 23:53:50'),(30,'Delhi Office','DO',3,1,'2025-10-22 23:54:00'),(31,'Central Chennai','CCN',5,1,'2025-10-23 02:02:50'),(32,'Buffer','BF',1,1,'2025-10-28 16:17:35'),(33,'Buffer_roster','BR',1,1,'2025-10-28 16:17:43');
/*!40000 ALTER TABLE `clusters` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `departments`
--

DROP TABLE IF EXISTS `departments`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `departments` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `code` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `business_unit_id` int DEFAULT NULL,
  `is_active` tinyint(1) DEFAULT '1',
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `code` (`code`),
  UNIQUE KEY `code_2` (`code`),
  KEY `business_unit_id` (`business_unit_id`),
  CONSTRAINT `departments_ibfk_1` FOREIGN KEY (`business_unit_id`) REFERENCES `business_units` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB AUTO_INCREMENT=9 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `departments`
--

LOCK TABLES `departments` WRITE;
/*!40000 ALTER TABLE `departments` DISABLE KEYS */;
INSERT INTO `departments` VALUES (1,'Revenue and Operations','Rev & Ops',1,1,'2025-10-23 00:25:55'),(2,'Learning & Development','L&D',1,1,'2025-10-23 00:29:07'),(3,'Human Resource and Adminstration','HRM',1,1,'2025-10-23 00:34:06'),(4,'Research and Developpment','R&D',1,1,'2025-10-23 02:07:42'),(5,'EV Team','EV',1,1,'2025-10-23 02:09:38'),(8,'Yumove','YMV',1,1,'2025-10-28 00:13:26');
/*!40000 ALTER TABLE `departments` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `employee_leave_policy`
--

DROP TABLE IF EXISTS `employee_leave_policy`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `employee_leave_policy` (
  `id` int NOT NULL AUTO_INCREMENT,
  `employee_id` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'UUID or employee ID (placeholder until profile exists)',
  `employee_name` varchar(200) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'Employee name for display',
  `policy_id` int NOT NULL,
  `assigned_date` date NOT NULL,
  `effective_from` date NOT NULL,
  `effective_to` date DEFAULT NULL,
  `doj` date DEFAULT NULL COMMENT 'Date of joining for proration',
  `city` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'Employee city for RH allocation',
  `is_active` tinyint(1) DEFAULT '1',
  `assigned_by` int DEFAULT NULL,
  `reason` text COLLATE utf8mb4_unicode_ci COMMENT 'Reason for policy assignment/change',
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_employee_id` (`employee_id`),
  KEY `idx_policy_id` (`policy_id`),
  KEY `idx_is_active` (`is_active`),
  KEY `idx_effective_dates` (`effective_from`,`effective_to`),
  CONSTRAINT `employee_leave_policy_ibfk_1` FOREIGN KEY (`policy_id`) REFERENCES `leave_policy_master` (`id`) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Employee to policy mapping (placeholder - FK to employee table pending)';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `employee_leave_policy`
--

LOCK TABLES `employee_leave_policy` WRITE;
/*!40000 ALTER TABLE `employee_leave_policy` DISABLE KEYS */;
/*!40000 ALTER TABLE `employee_leave_policy` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `employees`
--

DROP TABLE IF EXISTS `employees`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `employees` (
  `id` int NOT NULL AUTO_INCREMENT,
  `candidate_id` int NOT NULL,
  `onboarding_id` int NOT NULL,
  `field_training_id` int DEFAULT NULL,
  `name` varchar(255) NOT NULL,
  `mobile_number` varchar(20) DEFAULT NULL,
  `email` varchar(255) DEFAULT NULL,
  `city` varchar(100) DEFAULT NULL,
  `cluster` varchar(100) DEFAULT NULL,
  `role` varchar(100) DEFAULT NULL,
  `legal_entity` varchar(255) DEFAULT NULL,
  `business_unit_name` varchar(255) DEFAULT NULL,
  `function_name` varchar(255) DEFAULT NULL,
  `department_name` varchar(255) DEFAULT NULL,
  `sub_department_name` varchar(255) DEFAULT NULL,
  `employment_type` varchar(50) DEFAULT NULL,
  `manager_name` varchar(255) DEFAULT NULL,
  `date_of_joining` date DEFAULT NULL,
  `gross_salary` decimal(10,2) DEFAULT NULL,
  `resume_source` varchar(50) DEFAULT NULL,
  `cost_centre` varchar(100) DEFAULT NULL,
  `vendor_id` int DEFAULT NULL,
  `vendor_name` varchar(255) DEFAULT NULL,
  `recruiter_id` int DEFAULT NULL,
  `recruiter_name` varchar(255) DEFAULT NULL,
  `referral_name` varchar(255) DEFAULT NULL,
  `referral_contact` varchar(20) DEFAULT NULL,
  `referral_relation` varchar(100) DEFAULT NULL,
  `direct_source` varchar(255) DEFAULT NULL,
  `gender` enum('male','female','other') DEFAULT NULL,
  `date_of_birth` date DEFAULT NULL,
  `blood_group` varchar(10) DEFAULT NULL,
  `marital_status` enum('single','married','divorced','widowed') DEFAULT NULL,
  `physically_handicapped` varchar(50) DEFAULT NULL,
  `nationality` varchar(100) DEFAULT NULL,
  `international_worker` varchar(50) DEFAULT NULL,
  `pan_number` varchar(20) DEFAULT NULL,
  `name_as_per_pan` varchar(255) DEFAULT NULL,
  `aadhar_number` varchar(20) DEFAULT NULL,
  `name_as_per_aadhar` varchar(255) DEFAULT NULL,
  `account_number` varchar(50) DEFAULT NULL,
  `ifsc_code` varchar(20) DEFAULT NULL,
  `bank_name` varchar(255) DEFAULT NULL,
  `present_address` text,
  `permanent_address` text,
  `emergency_contact_number` varchar(20) DEFAULT NULL,
  `emergency_contact_name` varchar(255) DEFAULT NULL,
  `emergency_contact_relation` varchar(50) DEFAULT NULL,
  `father_name` varchar(255) DEFAULT NULL,
  `user_id` varchar(20) DEFAULT NULL,
  `employee_id` varchar(50) DEFAULT NULL,
  `uan_number` varchar(12) DEFAULT NULL,
  `esic_ip_number` varchar(20) DEFAULT NULL,
  `group_doj` date DEFAULT NULL,
  `assets` text,
  `documents` text,
  `paygrade` varchar(50) DEFAULT NULL,
  `payband` varchar(50) DEFAULT NULL,
  `working_status` enum('working','relieved') DEFAULT 'working' COMMENT 'working: employee is active (no exit_date), relieved: employee has left (has exit_date)',
  `date_of_exit` date DEFAULT NULL,
  `exit_type` enum('voluntary','involuntary','absconding') DEFAULT NULL COMMENT 'Type of employee exit: voluntary, involuntary, or absconding',
  `exit_reason` text COMMENT 'Specific reason for exit from predefined dropdown list',
  `exit_initiated_date` date DEFAULT NULL,
  `lwd` date DEFAULT NULL,
  `discussion_with_employee` enum('yes','no') DEFAULT NULL COMMENT 'Whether discussion was held with employee',
  `discussion_summary` text COMMENT 'Summary of discussion with employee',
  `termination_notice_date` date DEFAULT NULL COMMENT 'Notice date for termination/resignation',
  `notice_period_served` enum('yes','no') DEFAULT NULL COMMENT 'Whether employee served notice period (yes=original, no=other)',
  `okay_to_rehire` enum('yes','no') DEFAULT NULL COMMENT 'Whether employee is okay to rehire',
  `absconding_letter_sent` enum('yes','no') DEFAULT NULL COMMENT 'For absconding cases - whether letter was sent',
  `exit_additional_comments` text COMMENT 'Additional comments during exit initiation',
  `profile_created_at` timestamp NULL DEFAULT NULL,
  `profile_created_by` int DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_candidate_employee` (`candidate_id`),
  UNIQUE KEY `unique_onboarding_employee` (`onboarding_id`),
  UNIQUE KEY `employee_id` (`employee_id`),
  KEY `field_training_id` (`field_training_id`),
  KEY `profile_created_by` (`profile_created_by`),
  KEY `idx_employee_id` (`employee_id`),
  KEY `idx_working_status` (`working_status`),
  KEY `idx_city` (`city`),
  KEY `idx_role` (`role`),
  KEY `idx_exit_type` (`exit_type`),
  KEY `idx_date_of_exit` (`date_of_exit`),
  KEY `idx_exit_initiated_date` (`exit_initiated_date`),
  KEY `idx_okay_to_rehire` (`okay_to_rehire`),
  KEY `idx_lwd` (`lwd`),
  CONSTRAINT `employees_ibfk_1` FOREIGN KEY (`candidate_id`) REFERENCES `candidates` (`id`) ON DELETE RESTRICT,
  CONSTRAINT `employees_ibfk_2` FOREIGN KEY (`onboarding_id`) REFERENCES `onboarding` (`id`) ON DELETE RESTRICT,
  CONSTRAINT `employees_ibfk_3` FOREIGN KEY (`field_training_id`) REFERENCES `field_training` (`id`) ON DELETE SET NULL,
  CONSTRAINT `employees_ibfk_4` FOREIGN KEY (`profile_created_by`) REFERENCES `users` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `employees`
--

LOCK TABLES `employees` WRITE;
/*!40000 ALTER TABLE `employees` DISABLE KEYS */;
INSERT INTO `employees` VALUES (2,5,1,1,'sagar K M','7411889572','kmsagar515@gmail.com','Bangalore','Indiranagar','Workshop Technician','YULU','Yulu Mobility','Yulu Ground Operations','Revenue and Operations','Repair and Maintenance','Contract','Satyajith','2025-10-29',26000.00,'vendor','Xpheno',7,'Xpheno',NULL,NULL,NULL,NULL,NULL,NULL,'male','1995-08-25','O+','single','No','Indian','No','JCVPS6323A','SAGAR K M','742482467235','Sagar K M','560100300547','HDFC00000855','HDFC','32 Dhenupuri, 2nd cross, As nagar, MEI colony,Laggere,Bangalore 560058','32 Dhenupuri, 2nd cross, As nagar, MEI colony,Laggere,Bangalore 560058','7026590193','Manjula','Mother','Late Mahalingappa','1234567','XPH1023','123456789012',NULL,NULL,NULL,NULL,NULL,NULL,'working',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'2025-11-19 00:10:20',NULL,'2025-11-19 00:10:20','2025-11-26 03:10:43');
/*!40000 ALTER TABLE `employees` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `exit_audit_trail`
--

DROP TABLE IF EXISTS `exit_audit_trail`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `exit_audit_trail` (
  `id` int NOT NULL AUTO_INCREMENT,
  `employee_id` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'Employee ID from employees table',
  `action_type` enum('EXIT_INITIATED','EXIT_REVOKED','EXIT_UPDATED','LWD_CHANGED','STATUS_CHANGED') COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'Type of exit action performed',
  `action_description` text COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'Detailed description of the action',
  `previous_exit_type` enum('voluntary','involuntary','absconding') COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'Previous exit type',
  `previous_exit_reason` text COLLATE utf8mb4_unicode_ci COMMENT 'Previous exit reason',
  `previous_lwd` date DEFAULT NULL COMMENT 'Previous last working day',
  `previous_exit_initiated_date` date DEFAULT NULL COMMENT 'Previous exit initiated date',
  `previous_working_status` enum('working','relieved') COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'Previous working status',
  `new_exit_type` enum('voluntary','involuntary','absconding') COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'New exit type',
  `new_exit_reason` text COLLATE utf8mb4_unicode_ci COMMENT 'New exit reason',
  `new_lwd` date DEFAULT NULL COMMENT 'New last working day',
  `new_exit_initiated_date` date DEFAULT NULL COMMENT 'New exit initiated date',
  `new_working_status` enum('working','relieved') COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'New working status',
  `exit_data_snapshot` json DEFAULT NULL COMMENT 'Complete snapshot of exit-related data',
  `performed_by` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'User who performed the action (user_id or system)',
  `performed_by_name` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'Name of user who performed the action',
  `performed_by_role` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'Role of user who performed the action',
  `ip_address` varchar(45) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'IP address from where action was performed',
  `user_agent` text COLLATE utf8mb4_unicode_ci COMMENT 'Browser/client user agent',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP COMMENT 'When the audit record was created',
  PRIMARY KEY (`id`),
  KEY `idx_employee_id` (`employee_id`),
  KEY `idx_action_type` (`action_type`),
  KEY `idx_created_at` (`created_at`),
  KEY `idx_employee_action` (`employee_id`,`action_type`),
  KEY `idx_performed_by` (`performed_by`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Audit trail for all exit-related operations and changes';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `exit_audit_trail`
--

LOCK TABLES `exit_audit_trail` WRITE;
/*!40000 ALTER TABLE `exit_audit_trail` DISABLE KEYS */;
INSERT INTO `exit_audit_trail` VALUES (1,'XPH1023','EXIT_REVOKED','Exit revoked for employee XPH1023. Previous type: absconding, Previous LWD: Thu Dec 25 2025 00:00:00 GMT+0530 (India Standard Time)','absconding',NULL,'2025-12-25','2025-11-25','working',NULL,NULL,NULL,NULL,'working','{\"lwd\": \"2025-12-24T18:30:00.000Z\", \"exit_type\": \"absconding\", \"exit_reason\": null, \"okay_to_rehire\": \"no\", \"working_status\": \"working\", \"discussion_summary\": null, \"exit_initiated_date\": \"2025-11-24T18:30:00.000Z\", \"notice_period_served\": \"no\", \"absconding_letter_sent\": \"yes\", \"termination_notice_date\": \"2025-11-24T18:30:00.000Z\", \"discussion_with_employee\": \"no\", \"exit_additional_comments\": null}','system','System User','admin','127.0.0.1','curl/8.7.1','2025-11-26 02:59:04'),(2,'XPH1023','EXIT_INITIATED','Exit initiated for employee XPH1023. Type: voluntary, Reason: Better Career Opportunity, LWD: 2025-11-28',NULL,NULL,NULL,NULL,'working','voluntary','Better Career Opportunity','2025-11-28','2025-11-26','working','{\"exitType\": \"voluntary\", \"exitReason\": \"Better Career Opportunity\", \"okayToRehire\": \"yes\", \"lastWorkingDay\": \"2025-11-28\", \"discussionSummary\": \"\", \"additionalComments\": \"\", \"noticePeriodServed\": \"no\", \"terminationNoticeDate\": \"2025-11-26\", \"discussionWithEmployee\": \"yes\"}','system','System User','admin','127.0.0.1','Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36','2025-11-26 03:10:40'),(3,'XPH1023','EXIT_REVOKED','Exit revoked for employee XPH1023. Previous type: voluntary, Previous LWD: Fri Nov 28 2025 00:00:00 GMT+0530 (India Standard Time)','voluntary','Better Career Opportunity','2025-11-28','2025-11-26','working',NULL,NULL,NULL,NULL,'working','{\"lwd\": \"2025-11-27T18:30:00.000Z\", \"exit_type\": \"voluntary\", \"exit_reason\": \"Better Career Opportunity\", \"okay_to_rehire\": \"yes\", \"working_status\": \"working\", \"discussion_summary\": null, \"exit_initiated_date\": \"2025-11-25T18:30:00.000Z\", \"notice_period_served\": \"no\", \"absconding_letter_sent\": null, \"termination_notice_date\": \"2025-11-25T18:30:00.000Z\", \"discussion_with_employee\": \"yes\", \"exit_additional_comments\": null}','system','System User','admin','127.0.0.1','Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36','2025-11-26 03:10:43');
/*!40000 ALTER TABLE `exit_audit_trail` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `field_training`
--

DROP TABLE IF EXISTS `field_training`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `field_training` (
  `id` int NOT NULL AUTO_INCREMENT,
  `classroom_training_id` int NOT NULL,
  `candidate_id` int NOT NULL,
  `buddy_aligned` enum('yes','no') COLLATE utf8mb4_unicode_ci DEFAULT 'no',
  `buddy_name` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `buddy_phone_number` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `manager_feedback` text COLLATE utf8mb4_unicode_ci,
  `ft_feedback` enum('fit','not_fit_ft_rejection') COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `rejection_reason` text COLLATE utf8mb4_unicode_ci,
  `absconding` enum('yes','no') COLLATE utf8mb4_unicode_ci DEFAULT 'no',
  `last_reporting_date` date DEFAULT NULL,
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `classroom_training_id` (`classroom_training_id`),
  KEY `candidate_id` (`candidate_id`),
  CONSTRAINT `field_training_ibfk_1` FOREIGN KEY (`classroom_training_id`) REFERENCES `classroom_training` (`id`) ON DELETE CASCADE,
  CONSTRAINT `field_training_ibfk_2` FOREIGN KEY (`candidate_id`) REFERENCES `candidates` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `field_training`
--

LOCK TABLES `field_training` WRITE;
/*!40000 ALTER TABLE `field_training` DISABLE KEYS */;
INSERT INTO `field_training` VALUES (1,2,5,'yes','Shankrappa','9876543120',NULL,'fit',NULL,'no',NULL,'2025-11-07 10:12:47','2025-11-07 10:30:02');
/*!40000 ALTER TABLE `field_training` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `functions`
--

DROP TABLE IF EXISTS `functions`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `functions` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `code` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `is_active` tinyint(1) DEFAULT '1',
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `code` (`code`),
  UNIQUE KEY `code_2` (`code`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `functions`
--

LOCK TABLES `functions` WRITE;
/*!40000 ALTER TABLE `functions` DISABLE KEYS */;
INSERT INTO `functions` VALUES (1,'Yulu Ground Operations','YGO',1,'2025-10-23 00:17:24'),(2,'Yulu Corporate','YC',1,'2025-10-30 18:57:02');
/*!40000 ALTER TABLE `functions` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `hiring_requests`
--

DROP TABLE IF EXISTS `hiring_requests`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `hiring_requests` (
  `id` int NOT NULL AUTO_INCREMENT,
  `request_id` varchar(20) COLLATE utf8mb4_unicode_ci NOT NULL,
  `city_id` int DEFAULT NULL,
  `cluster_id` int DEFAULT NULL,
  `role_id` int DEFAULT NULL,
  `position_title` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `no_of_openings` int NOT NULL,
  `request_type` enum('backfill','fresh','training_attrition') COLLATE utf8mb4_unicode_ci NOT NULL,
  `priority` enum('P0','P1','P2','P3') COLLATE utf8mb4_unicode_ci NOT NULL,
  `status` enum('open','closed','called_off') COLLATE utf8mb4_unicode_ci DEFAULT 'open',
  `description` text COLLATE utf8mb4_unicode_ci,
  `requirements` text COLLATE utf8mb4_unicode_ci,
  `request_date` datetime NOT NULL,
  `created_by` int DEFAULT NULL,
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `request_id` (`request_id`),
  KEY `idx_hiring_requests_city_id` (`city_id`),
  KEY `idx_hiring_requests_cluster_id` (`cluster_id`),
  KEY `idx_hiring_requests_role_id` (`role_id`),
  KEY `idx_hiring_requests_created_by` (`created_by`),
  CONSTRAINT `hiring_requests_ibfk_1` FOREIGN KEY (`city_id`) REFERENCES `cities` (`id`) ON DELETE SET NULL,
  CONSTRAINT `hiring_requests_ibfk_2` FOREIGN KEY (`cluster_id`) REFERENCES `clusters` (`id`) ON DELETE SET NULL,
  CONSTRAINT `hiring_requests_ibfk_3` FOREIGN KEY (`role_id`) REFERENCES `roles` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB AUTO_INCREMENT=24 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `hiring_requests`
--

LOCK TABLES `hiring_requests` WRITE;
/*!40000 ALTER TABLE `hiring_requests` DISABLE KEYS */;
INSERT INTO `hiring_requests` VALUES (1,'BLR_QCA_HBL_0001',1,6,1,'Position',1,'fresh','P0','open','',NULL,'2025-10-28 00:00:00',1,'2025-10-28 16:14:14','2025-10-28 16:14:14'),(2,'BLR_QCA_HBL_0002',1,6,1,'Position',1,'fresh','P1','open','',NULL,'2025-10-28 00:00:00',1,'2025-10-28 16:14:56','2025-10-28 16:14:56'),(3,'BLR_QCA_HBL_0003',1,6,1,'Position',1,'fresh','P1','open','',NULL,'2025-10-28 00:00:00',1,'2025-10-28 16:15:14','2025-10-28 16:15:14'),(4,'BLR_BC_HBL_0001',1,6,4,'Position',1,'fresh','P0','open','',NULL,'2025-10-28 00:00:00',1,'2025-10-28 16:15:35','2025-10-28 16:15:35'),(5,'BLR_BC_HBL_0002',1,6,4,'Position',1,'fresh','P0','open','',NULL,'2025-10-28 00:00:00',1,'2025-10-28 16:15:35','2025-10-28 16:15:35'),(6,'BLR_BC_HBL_0003',1,6,4,'Position',1,'fresh','P0','open','',NULL,'2025-10-28 00:00:00',1,'2025-10-28 16:15:35','2025-10-28 16:15:35'),(7,'BLR_BW_HBL_0001',1,6,6,'Position',1,'fresh','P3','open','',NULL,'2025-10-28 00:00:00',1,'2025-10-28 16:15:59','2025-10-28 16:15:59'),(8,'BLR_QCA_BF_0004',1,32,1,'Position',1,'fresh','P2','open','',NULL,'2025-10-28 00:00:00',1,'2025-10-28 16:18:29','2025-10-28 16:18:29'),(9,'BLR_QCA_BF_0005',1,32,1,'Position',1,'fresh','P2','open','',NULL,'2025-10-28 00:00:00',1,'2025-10-28 16:18:29','2025-10-28 16:18:29'),(10,'BLR_QCA_BF_0006',1,32,1,'Position',1,'fresh','P2','open','',NULL,'2025-10-28 00:00:00',1,'2025-10-28 16:18:29','2025-10-28 16:18:29'),(11,'BLR_QCA_BF_0007',1,32,1,'Position',1,'fresh','P2','open','',NULL,'2025-10-28 00:00:00',1,'2025-10-28 16:18:29','2025-10-28 16:18:29'),(12,'BLR_RSAC_BF_0001',1,32,13,'Position',1,'fresh','P2','open','',NULL,'2025-10-28 00:00:00',1,'2025-10-28 16:18:54','2025-10-28 16:18:54'),(13,'BLR_BC_CBD_0004',1,5,4,'Position',1,'fresh','P0','open','',NULL,'2025-10-28 00:00:00',1,'2025-10-28 16:19:46','2025-10-28 16:19:46'),(14,'BLR_BC_CBD_0005',1,5,4,'Position',1,'fresh','P0','open','',NULL,'2025-10-28 00:00:00',1,'2025-10-28 16:19:46','2025-10-28 16:19:46'),(15,'BLR_QCA_CBD_0008',1,5,1,'Position',1,'fresh','P1','open','',NULL,'2025-10-28 00:00:00',1,'2025-10-28 16:20:18','2025-10-28 16:20:18'),(16,'BLR_BW_CBD_0002',1,5,6,'Position',1,'fresh','P1','open','',NULL,'2025-10-28 00:00:00',1,'2025-10-28 16:20:37','2025-10-28 16:20:37'),(17,'BLR_WT_IND_0001',1,3,3,'Position',1,'fresh','P0','open','',NULL,'2025-10-28 00:00:00',1,'2025-10-28 16:27:30','2025-10-28 16:27:30'),(18,'BLR_WT_IND_0002',1,3,3,'Position',1,'fresh','P0','open','',NULL,'2025-10-28 00:00:00',1,'2025-10-28 16:27:30','2025-10-28 16:27:30'),(19,'BLR_WT_IND_0003',1,3,3,'Position',1,'fresh','P0','open','',NULL,'2025-10-28 00:00:00',1,'2025-10-28 16:27:30','2025-10-28 16:27:30'),(20,'BLR_WT_IND_0004',1,3,3,'Position',1,'fresh','P0','open','',NULL,'2025-10-28 00:00:00',1,'2025-10-28 16:27:30','2025-10-28 16:27:30'),(21,'BLR_WT_IND_0005',1,3,3,'Position',1,'fresh','P0','open','',NULL,'2025-10-28 00:00:00',1,'2025-10-28 16:27:30','2025-10-28 16:27:30'),(22,'BLR_WT_IND_0006',1,3,3,'Position',1,'fresh','P0','open','',NULL,'2025-10-28 00:00:00',1,'2025-10-28 16:27:30','2025-10-28 16:27:30'),(23,'BLR_WT_IND_0007',1,3,3,'Position',1,'fresh','P0','open','',NULL,'2025-10-28 00:00:00',1,'2025-10-28 16:27:30','2025-10-28 16:27:30');
/*!40000 ALTER TABLE `hiring_requests` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `induction_training`
--

DROP TABLE IF EXISTS `induction_training`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `induction_training` (
  `id` int NOT NULL AUTO_INCREMENT,
  `candidate_id` int NOT NULL,
  `name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `mobile_number` varchar(20) COLLATE utf8mb4_unicode_ci NOT NULL,
  `city` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `cluster` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `role` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `date_of_joining` date DEFAULT NULL,
  `gross_salary` decimal(10,2) DEFAULT NULL,
  `joining_status` enum('joined','not_joined','pending') COLLATE utf8mb4_unicode_ci DEFAULT 'pending',
  `manager_name` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `induction_done_by` int DEFAULT NULL,
  `onboarding_form_filled` enum('yes','ytb','no') COLLATE utf8mb4_unicode_ci DEFAULT 'ytb',
  `uan_number_generated` enum('yes','ytb','no') COLLATE utf8mb4_unicode_ci DEFAULT 'ytb',
  `induction_status` enum('completed','ytb_completed','in_progress') COLLATE utf8mb4_unicode_ci DEFAULT 'in_progress',
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `candidate_id` (`candidate_id`),
  KEY `induction_done_by` (`induction_done_by`),
  CONSTRAINT `induction_training_ibfk_1` FOREIGN KEY (`candidate_id`) REFERENCES `candidates` (`id`) ON DELETE CASCADE,
  CONSTRAINT `induction_training_ibfk_2` FOREIGN KEY (`induction_done_by`) REFERENCES `trainers` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `induction_training`
--

LOCK TABLES `induction_training` WRITE;
/*!40000 ALTER TABLE `induction_training` DISABLE KEYS */;
INSERT INTO `induction_training` VALUES (1,5,'sagar K M','7411889572','Bangalore','Indiranagar','Workshop Technician','2025-10-29',26000.00,'joined','Satyajith',3,'yes','yes','completed','2025-11-07 08:25:00','2025-11-07 09:56:24');
/*!40000 ALTER TABLE `induction_training` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `leave_applications`
--

DROP TABLE IF EXISTS `leave_applications`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `leave_applications` (
  `id` int NOT NULL AUTO_INCREMENT,
  `employee_id` int NOT NULL,
  `leave_type` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'EL, SL_CL, PATERNITY, etc.',
  `start_date` date NOT NULL,
  `end_date` date NOT NULL,
  `total_days` decimal(5,2) NOT NULL COMMENT 'Total leave days (can be 0.5 for half day)',
  `reason` text COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'Reason for leave',
  `emergency_contact` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `emergency_phone` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `status` enum('DRAFT','PENDING','APPROVED','REJECTED','CANCELLED','WITHDRAWN') COLLATE utf8mb4_unicode_ci DEFAULT 'PENDING',
  `applied_to` int DEFAULT NULL COMMENT 'Manager/approver employee_id',
  `approved_by` int DEFAULT NULL COMMENT 'Final approver employee_id',
  `approved_at` datetime DEFAULT NULL,
  `rejection_reason` text COLLATE utf8mb4_unicode_ci,
  `doc_required` tinyint(1) DEFAULT '0' COMMENT 'Is document required for this leave?',
  `doc_submitted` tinyint(1) DEFAULT '0' COMMENT 'Has employee submitted documents?',
  `doc_verified` tinyint(1) DEFAULT '0' COMMENT 'Has admin verified documents?',
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `created_by` int NOT NULL,
  `updated_by` int DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_employee` (`employee_id`),
  KEY `idx_leave_type` (`leave_type`),
  KEY `idx_status` (`status`),
  KEY `idx_start_date` (`start_date`),
  KEY `idx_end_date` (`end_date`),
  KEY `idx_created_at` (`created_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Leave applications submitted by employees';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `leave_applications`
--

LOCK TABLES `leave_applications` WRITE;
/*!40000 ALTER TABLE `leave_applications` DISABLE KEYS */;
/*!40000 ALTER TABLE `leave_applications` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `leave_audit_trail`
--

DROP TABLE IF EXISTS `leave_audit_trail`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `leave_audit_trail` (
  `id` int NOT NULL AUTO_INCREMENT,
  `entity_type` enum('CONFIG','POLICY','HOLIDAY','EMPLOYEE_ASSIGN','POLICY_MAPPING') COLLATE utf8mb4_unicode_ci NOT NULL,
  `entity_id` int NOT NULL COMMENT 'ID of the entity being changed',
  `entity_name` varchar(200) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'Name/identifier of the entity',
  `action_type` enum('CREATE','EDIT','DELETE','ACTIVATE','DEACTIVATE') COLLATE utf8mb4_unicode_ci NOT NULL,
  `old_value` json DEFAULT NULL COMMENT 'Previous state (full record)',
  `new_value` json DEFAULT NULL COMMENT 'New state (full record)',
  `summary` text COLLATE utf8mb4_unicode_ci COMMENT 'Human-readable summary of changes',
  `change_reason` text COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'Mandatory reason for change (min 10 chars)',
  `changed_by` int NOT NULL COMMENT 'User ID who made the change',
  `changed_by_name` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'User name for display',
  `changed_by_role` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'User role at time of change',
  `ip_address` varchar(45) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'IP address of user',
  `user_agent` text COLLATE utf8mb4_unicode_ci COMMENT 'Browser/client information',
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_entity_type` (`entity_type`),
  KEY `idx_entity_id` (`entity_id`),
  KEY `idx_action_type` (`action_type`),
  KEY `idx_changed_by` (`changed_by`),
  KEY `idx_created_at` (`created_at`),
  KEY `idx_entity_search` (`entity_type`,`entity_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Audit trail for all leave management changes';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `leave_audit_trail`
--

LOCK TABLES `leave_audit_trail` WRITE;
/*!40000 ALTER TABLE `leave_audit_trail` DISABLE KEYS */;
/*!40000 ALTER TABLE `leave_audit_trail` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `leave_config`
--

DROP TABLE IF EXISTS `leave_config`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `leave_config` (
  `id` int NOT NULL AUTO_INCREMENT,
  `leave_type` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'EL, SL, CL, Paternity, Bereavement, RH, Govt',
  `display_name` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'Earned Leave, Sick Leave, etc.',
  `allocation_type` enum('ANNUAL','MONTHLY_ACCRUAL','ONE_TIME') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'ANNUAL',
  `annual_quota` decimal(5,2) DEFAULT NULL COMMENT 'Annual total (e.g., 18 for EL)',
  `monthly_accrual` decimal(5,2) DEFAULT NULL COMMENT 'Monthly accrual rate (e.g., 1.5 for EL)',
  `prorate_enabled` tinyint(1) DEFAULT '1' COMMENT 'Whether to prorate based on DOJ',
  `carry_forward_enabled` tinyint(1) DEFAULT '0',
  `max_carry_forward` decimal(5,2) DEFAULT NULL,
  `encashment_enabled` tinyint(1) DEFAULT '0',
  `max_encashment` decimal(5,2) DEFAULT NULL,
  `eligibility_months` int DEFAULT '0' COMMENT 'Months before employee can avail (3 for EL)',
  `max_consecutive_days` int DEFAULT NULL COMMENT 'Max consecutive days allowed',
  `min_notice_days` int DEFAULT NULL COMMENT 'Minimum notice days required',
  `doc_required_days` int DEFAULT NULL COMMENT 'Days after which documentation is required',
  `is_active` tinyint(1) DEFAULT '1',
  `description` text COLLATE utf8mb4_unicode_ci,
  `rules` json DEFAULT NULL COMMENT 'Complex rules as JSON',
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `created_by` int DEFAULT NULL,
  `updated_by` int DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `leave_type` (`leave_type`),
  KEY `idx_leave_type` (`leave_type`),
  KEY `idx_is_active` (`is_active`)
) ENGINE=InnoDB AUTO_INCREMENT=8 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Leave type configuration and rules';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `leave_config`
--

LOCK TABLES `leave_config` WRITE;
/*!40000 ALTER TABLE `leave_config` DISABLE KEYS */;
INSERT INTO `leave_config` VALUES (1,'EL','Earned Leave','MONTHLY_ACCRUAL',18.00,1.50,1,1,12.00,1,NULL,3,NULL,NULL,NULL,1,'Earned leave accrues at 1.5 days per month. Cannot be availed in first 3 months but accrues. Prorated based on DOJ.','{\"doc_required\": \"none\", \"notice_periods\": {\"1-2_days\": 1, \"3-7_days\": 15, \"8-20_days\": 30}, \"max_consecutive\": 20}','2025-11-12 05:09:47','2025-11-12 05:09:47',NULL,NULL),(2,'SL_CL','Sick Leave / Casual Leave (SL/CL)','MONTHLY_ACCRUAL',12.00,1.00,1,0,NULL,0,NULL,0,NULL,NULL,3,1,'Combined SL and CL accrues at 1 day per month (12 days total per year). Prorated based on DOJ. Medical document required for 3+ days. Can be used for both sickness and casual purposes.','{\"doc_rules\": {\"3+_days\": \"medical_certificate_required\", \"1-2_days\": \"not_required\"}, \"notice_period\": \"same_day_or_next_day\", \"combined_sl_cl\": true, \"total_per_year\": 12, \"monthly_accrual\": 1}','2025-11-12 05:09:47','2025-11-12 11:27:53',NULL,NULL),(4,'PATERNITY','Paternity Leave','ANNUAL',15.00,NULL,0,0,NULL,0,NULL,6,NULL,30,NULL,1,'Paternity leave of 15 days per year. Eligible after 6 months of service. 1 month prior notice required.','{\"eligibility\": \"6_months_service\", \"doc_required\": \"birth_certificate_or_adoption_papers\", \"notice_period\": \"30_days_prior\"}','2025-11-12 05:09:47','2025-11-12 05:09:47',NULL,NULL),(5,'BEREAVEMENT','Bereavement Leave','ANNUAL',3.00,NULL,0,0,NULL,0,NULL,0,NULL,NULL,NULL,1,'Bereavement leave of 3 days per year. No proration. No documentation required. Immediate family only.','{\"prorate\": \"no\", \"doc_required\": \"no\", \"notice_period\": \"emergency_basis\", \"eligible_relations\": [\"parent\", \"spouse\", \"child\", \"sibling\", \"grandparent\"]}','2025-11-12 05:09:47','2025-11-12 05:09:47',NULL,NULL),(6,'RH','Restricted Holiday','ANNUAL',NULL,NULL,1,0,NULL,0,NULL,0,NULL,NULL,NULL,1,'Restricted holidays allocated per city. Bangalore/Hyderabad: 5 per year. Mumbai/Delhi/TN: 6 per year. Prorated based on DOJ.','{\"advance_notice\": 7, \"city_allocations\": {\"Delhi\": 6, \"Mumbai\": 6, \"Chennai\": 6, \"Bangalore\": 5, \"Hyderabad\": 5, \"Tamil Nadu\": 6}, \"selection_required\": true}','2025-11-12 05:09:47','2025-11-12 05:09:47',NULL,NULL),(7,'GOVT','Government Holiday','ANNUAL',NULL,NULL,0,0,NULL,0,NULL,0,NULL,NULL,NULL,1,'Government holidays are predefined per state/city. Not selectable by employees.','{\"type\": \"informational\", \"year_wise\": true, \"maintained_by\": \"HR\"}','2025-11-12 05:09:47','2025-11-12 05:09:47',NULL,NULL);
/*!40000 ALTER TABLE `leave_config` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `leave_holidays`
--

DROP TABLE IF EXISTS `leave_holidays`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `leave_holidays` (
  `id` int NOT NULL AUTO_INCREMENT,
  `year` int NOT NULL,
  `holiday_date` date NOT NULL,
  `holiday_name` varchar(200) COLLATE utf8mb4_unicode_ci NOT NULL,
  `holiday_type` enum('GOVERNMENT','RESTRICTED') COLLATE utf8mb4_unicode_ci NOT NULL,
  `city` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'Applicable city for restricted holidays',
  `state` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'State for government holidays',
  `is_optional` tinyint(1) DEFAULT '0',
  `description` text COLLATE utf8mb4_unicode_ci,
  `is_active` tinyint(1) DEFAULT '1',
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `created_by` int DEFAULT NULL,
  `updated_by` int DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_holiday` (`year`,`holiday_date`,`holiday_type`,`city`),
  KEY `idx_year` (`year`),
  KEY `idx_holiday_date` (`holiday_date`),
  KEY `idx_holiday_type` (`holiday_type`),
  KEY `idx_city` (`city`),
  KEY `idx_is_active` (`is_active`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Government and restricted holidays by year and city';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `leave_holidays`
--

LOCK TABLES `leave_holidays` WRITE;
/*!40000 ALTER TABLE `leave_holidays` DISABLE KEYS */;
/*!40000 ALTER TABLE `leave_holidays` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `leave_policy_mapping`
--

DROP TABLE IF EXISTS `leave_policy_mapping`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `leave_policy_mapping` (
  `id` int NOT NULL AUTO_INCREMENT,
  `policy_id` int NOT NULL,
  `leave_type` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `allocation_override` decimal(5,2) DEFAULT NULL COMMENT 'Override annual quota for this policy',
  `accrual_override` decimal(5,2) DEFAULT NULL COMMENT 'Override monthly accrual',
  `eligibility_override` int DEFAULT NULL COMMENT 'Override eligibility months',
  `notice_days_override` int DEFAULT NULL COMMENT 'Override notice period',
  `doc_required_override` int DEFAULT NULL COMMENT 'Override doc requirement',
  `is_enabled` tinyint(1) DEFAULT '1' COMMENT 'Whether this leave type is enabled in this policy',
  `custom_rules` json DEFAULT NULL COMMENT 'Policy-specific custom rules',
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_policy_leave` (`policy_id`,`leave_type`),
  KEY `idx_policy_id` (`policy_id`),
  KEY `idx_leave_type` (`leave_type`),
  CONSTRAINT `leave_policy_mapping_ibfk_1` FOREIGN KEY (`policy_id`) REFERENCES `leave_policy_master` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Mapping of leave types to policies with overrides';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `leave_policy_mapping`
--

LOCK TABLES `leave_policy_mapping` WRITE;
/*!40000 ALTER TABLE `leave_policy_mapping` DISABLE KEYS */;
/*!40000 ALTER TABLE `leave_policy_mapping` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `leave_policy_master`
--

DROP TABLE IF EXISTS `leave_policy_master`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `leave_policy_master` (
  `id` int NOT NULL AUTO_INCREMENT,
  `policy_name` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `policy_code` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` text COLLATE utf8mb4_unicode_ci,
  `effective_from` date NOT NULL,
  `effective_to` date DEFAULT NULL,
  `is_default` tinyint(1) DEFAULT '0' COMMENT 'Default policy for new employees',
  `is_active` tinyint(1) DEFAULT '1',
  `version` int DEFAULT '1' COMMENT 'Policy version number',
  `parent_policy_id` int DEFAULT NULL COMMENT 'Reference to previous version',
  `city` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'City-specific policy (if applicable)',
  `department` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'Department-specific policy (if applicable)',
  `business_unit` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'Business unit-specific policy',
  `employee_type` enum('FULL_TIME','CONTRACT','INTERN','ALL') COLLATE utf8mb4_unicode_ci DEFAULT 'ALL',
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `created_by` int DEFAULT NULL,
  `updated_by` int DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `policy_name` (`policy_name`),
  UNIQUE KEY `policy_code` (`policy_code`),
  KEY `parent_policy_id` (`parent_policy_id`),
  KEY `idx_policy_code` (`policy_code`),
  KEY `idx_is_active` (`is_active`),
  KEY `idx_effective_dates` (`effective_from`,`effective_to`),
  KEY `idx_city` (`city`),
  CONSTRAINT `leave_policy_master_ibfk_1` FOREIGN KEY (`parent_policy_id`) REFERENCES `leave_policy_master` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Leave policy master definitions';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `leave_policy_master`
--

LOCK TABLES `leave_policy_master` WRITE;
/*!40000 ALTER TABLE `leave_policy_master` DISABLE KEYS */;
/*!40000 ALTER TABLE `leave_policy_master` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `leave_rh_allocation`
--

DROP TABLE IF EXISTS `leave_rh_allocation`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `leave_rh_allocation` (
  `id` int NOT NULL AUTO_INCREMENT,
  `year` int NOT NULL,
  `city` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `total_rh` int NOT NULL COMMENT 'Total RH allocation for city (5 or 6)',
  `month_allocation` json NOT NULL COMMENT 'Monthly distribution {Jan:6, Feb:6, Mar:5, ...}',
  `is_active` tinyint(1) DEFAULT '1',
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `created_by` int DEFAULT NULL,
  `updated_by` int DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_year_city` (`year`,`city`),
  KEY `idx_year` (`year`),
  KEY `idx_city` (`city`)
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Restricted holiday allocation per city per year';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `leave_rh_allocation`
--

LOCK TABLES `leave_rh_allocation` WRITE;
/*!40000 ALTER TABLE `leave_rh_allocation` DISABLE KEYS */;
INSERT INTO `leave_rh_allocation` VALUES (1,2025,'Bangalore',5,'{\"Apr\": 4, \"Aug\": 2, \"Dec\": 1, \"Feb\": 5, \"Jan\": 5, \"Jul\": 2, \"Jun\": 3, \"Mar\": 4, \"May\": 3, \"Nov\": 1, \"Oct\": 1, \"Sep\": 1}',1,'2025-11-12 05:09:47','2025-11-12 05:09:47',NULL,NULL),(2,2025,'Hyderabad',5,'{\"Apr\": 4, \"Aug\": 2, \"Dec\": 1, \"Feb\": 5, \"Jan\": 5, \"Jul\": 2, \"Jun\": 3, \"Mar\": 4, \"May\": 3, \"Nov\": 1, \"Oct\": 1, \"Sep\": 1}',1,'2025-11-12 05:09:47','2025-11-12 05:09:47',NULL,NULL),(3,2025,'Mumbai',6,'{\"Apr\": 5, \"Aug\": 3, \"Dec\": 1, \"Feb\": 6, \"Jan\": 6, \"Jul\": 3, \"Jun\": 4, \"Mar\": 5, \"May\": 4, \"Nov\": 1, \"Oct\": 2, \"Sep\": 2}',1,'2025-11-12 05:09:47','2025-11-12 05:09:47',NULL,NULL),(4,2025,'Delhi',6,'{\"Apr\": 5, \"Aug\": 3, \"Dec\": 1, \"Feb\": 6, \"Jan\": 6, \"Jul\": 3, \"Jun\": 4, \"Mar\": 5, \"May\": 4, \"Nov\": 1, \"Oct\": 2, \"Sep\": 2}',1,'2025-11-12 05:09:47','2025-11-12 05:09:47',NULL,NULL),(5,2025,'Chennai',6,'{\"Apr\": 5, \"Aug\": 3, \"Dec\": 1, \"Feb\": 6, \"Jan\": 6, \"Jul\": 3, \"Jun\": 4, \"Mar\": 5, \"May\": 4, \"Nov\": 1, \"Oct\": 2, \"Sep\": 2}',1,'2025-11-12 05:09:47','2025-11-12 05:09:47',NULL,NULL),(6,2025,'Tamil Nadu',6,'{\"Apr\": 5, \"Aug\": 3, \"Dec\": 1, \"Feb\": 6, \"Jan\": 6, \"Jul\": 3, \"Jun\": 4, \"Mar\": 5, \"May\": 4, \"Nov\": 1, \"Oct\": 2, \"Sep\": 2}',1,'2025-11-12 05:09:47','2025-11-12 05:09:47',NULL,NULL);
/*!40000 ALTER TABLE `leave_rh_allocation` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `onboarding`
--

DROP TABLE IF EXISTS `onboarding`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `onboarding` (
  `id` int NOT NULL AUTO_INCREMENT,
  `field_training_id` int NOT NULL,
  `candidate_id` int NOT NULL,
  `name` varchar(255) NOT NULL,
  `mobile_number` varchar(20) DEFAULT NULL,
  `email` varchar(255) DEFAULT NULL,
  `city` varchar(100) DEFAULT NULL,
  `cluster` varchar(100) DEFAULT NULL,
  `role` varchar(100) DEFAULT NULL,
  `legal_entity` varchar(255) DEFAULT NULL,
  `business_unit_name` varchar(255) DEFAULT NULL,
  `function_name` varchar(255) DEFAULT NULL,
  `department_name` varchar(255) DEFAULT NULL,
  `sub_department_name` varchar(255) DEFAULT NULL,
  `employment_type` varchar(50) DEFAULT NULL,
  `manager_name` varchar(255) DEFAULT NULL,
  `date_of_joining` date DEFAULT NULL,
  `gross_salary` decimal(10,2) DEFAULT NULL,
  `resume_source` enum('vendor','field_recruiter','referral','direct','other') DEFAULT NULL,
  `cost_centre` varchar(255) DEFAULT NULL,
  `vendor_id` int DEFAULT NULL,
  `vendor_name` varchar(255) DEFAULT NULL,
  `recruiter_id` int DEFAULT NULL,
  `recruiter_name` varchar(255) DEFAULT NULL,
  `referral_name` varchar(255) DEFAULT NULL,
  `referral_contact` varchar(20) DEFAULT NULL,
  `referral_relation` varchar(100) DEFAULT NULL,
  `direct_source` varchar(100) DEFAULT NULL,
  `gender` enum('male','female','other') DEFAULT NULL,
  `date_of_birth` date DEFAULT NULL,
  `blood_group` varchar(10) DEFAULT NULL,
  `marital_status` enum('single','married','divorced','widowed') DEFAULT NULL,
  `physically_handicapped` varchar(50) DEFAULT NULL COMMENT 'Yes or No only',
  `nationality` varchar(100) DEFAULT 'Indian',
  `international_worker` varchar(50) DEFAULT NULL COMMENT 'Yes or No only',
  `pan_number` varchar(20) DEFAULT NULL,
  `name_as_per_pan` varchar(255) DEFAULT NULL,
  `aadhar_number` varchar(20) DEFAULT NULL,
  `name_as_per_aadhar` varchar(255) DEFAULT NULL,
  `account_number` varchar(50) DEFAULT NULL,
  `ifsc_code` varchar(20) DEFAULT NULL,
  `bank_name` varchar(255) DEFAULT NULL,
  `name_as_per_bank` varchar(255) DEFAULT NULL,
  `present_address` text,
  `permanent_address` text,
  `emergency_contact_number` varchar(20) DEFAULT NULL,
  `emergency_contact_name` varchar(255) DEFAULT NULL,
  `emergency_contact_relation` varchar(50) DEFAULT NULL,
  `father_name` varchar(255) DEFAULT NULL,
  `father_dob` date DEFAULT NULL,
  `mother_name` varchar(255) DEFAULT NULL,
  `mother_dob` date DEFAULT NULL,
  `wife_name` varchar(255) DEFAULT NULL,
  `wife_dob` date DEFAULT NULL,
  `child1_name` varchar(255) DEFAULT NULL,
  `child1_gender` enum('male','female') DEFAULT NULL,
  `child1_dob` date DEFAULT NULL,
  `child2_name` varchar(255) DEFAULT NULL,
  `child2_gender` enum('male','female') DEFAULT NULL,
  `child2_dob` date DEFAULT NULL,
  `nominee_name` varchar(255) DEFAULT NULL,
  `nominee_relation` varchar(100) DEFAULT NULL,
  `user_id` varchar(20) DEFAULT NULL,
  `employee_id` varchar(50) DEFAULT NULL,
  `uan_number` varchar(12) DEFAULT NULL,
  `esic_ip_number` varchar(20) DEFAULT NULL,
  `onboarding_status` enum('yet_to_be_onboarded','onboarded') DEFAULT 'yet_to_be_onboarded',
  `profile_created` tinyint(1) DEFAULT '0',
  `is_locked` tinyint(1) DEFAULT '0' COMMENT 'Locks the record once onboarded - prevents further editing',
  `locked_at` timestamp NULL DEFAULT NULL,
  `locked_by` int DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `migrated_data` enum('YES','NO') DEFAULT 'NO' COMMENT 'YES for migration uploads, NO for regular uploads',
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_candidate_onboarding` (`candidate_id`),
  KEY `field_training_id` (`field_training_id`),
  KEY `fk_onboarding_vendor` (`vendor_id`),
  KEY `fk_onboarding_recruiter` (`recruiter_id`),
  KEY `idx_migrated_data` (`migrated_data`),
  KEY `fk_onboarding_locked_by` (`locked_by`),
  KEY `idx_onboarding_locked` (`is_locked`),
  KEY `idx_onboarding_status_locked` (`onboarding_status`,`is_locked`),
  CONSTRAINT `fk_onboarding_locked_by` FOREIGN KEY (`locked_by`) REFERENCES `users` (`id`) ON DELETE SET NULL,
  CONSTRAINT `fk_onboarding_recruiter` FOREIGN KEY (`recruiter_id`) REFERENCES `recruiters` (`id`) ON DELETE SET NULL,
  CONSTRAINT `fk_onboarding_vendor` FOREIGN KEY (`vendor_id`) REFERENCES `vendors` (`id`) ON DELETE SET NULL,
  CONSTRAINT `onboarding_ibfk_1` FOREIGN KEY (`field_training_id`) REFERENCES `field_training` (`id`) ON DELETE CASCADE,
  CONSTRAINT `onboarding_ibfk_2` FOREIGN KEY (`candidate_id`) REFERENCES `candidates` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `onboarding`
--

LOCK TABLES `onboarding` WRITE;
/*!40000 ALTER TABLE `onboarding` DISABLE KEYS */;
INSERT INTO `onboarding` VALUES (1,1,5,'sagar K M','7411889572','kmsagar515@gmail.com','Bangalore','Indiranagar','Workshop Technician','YULU','Yulu Mobility','Yulu Ground Operations','Revenue and Operations','Repair and Maintenance','Contract','Satyajith','2025-10-29',26000.00,'vendor','Xpheno',7,'Xpheno',NULL,NULL,NULL,NULL,NULL,NULL,'male','1995-08-25','O+','single','No','Indian','No','JCVPS6323A','SAGAR K M','742482467235','Sagar K M','560100300547','HDFC00000855','HDFC','Sagar K M','32 Dhenupuri, 2nd cross, As nagar, MEI colony,Laggere,Bangalore 560058','32 Dhenupuri, 2nd cross, As nagar, MEI colony,Laggere,Bangalore 560058','7026590193','Manjula','Mother','Late Mahalingappa','1964-01-01','Manjula R','1971-08-28',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'Manjula','Mother','1234567','XPH1023','123456789012',NULL,'onboarded',1,1,'2025-11-19 00:14:45',NULL,'2025-11-19 00:15:43','2025-11-20 00:17:31','NO');
/*!40000 ALTER TABLE `onboarding` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `recruiter_incentives`
--

DROP TABLE IF EXISTS `recruiter_incentives`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `recruiter_incentives` (
  `id` int NOT NULL AUTO_INCREMENT,
  `recruiter_id` int DEFAULT NULL,
  `month` varchar(20) COLLATE utf8mb4_unicode_ci NOT NULL,
  `incentive_amount` decimal(10,2) NOT NULL,
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `recruiter_id` (`recruiter_id`),
  CONSTRAINT `recruiter_incentives_ibfk_1` FOREIGN KEY (`recruiter_id`) REFERENCES `recruiters` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `recruiter_incentives`
--

LOCK TABLES `recruiter_incentives` WRITE;
/*!40000 ALTER TABLE `recruiter_incentives` DISABLE KEYS */;
/*!40000 ALTER TABLE `recruiter_incentives` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `recruiters`
--

DROP TABLE IF EXISTS `recruiters`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `recruiters` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `email` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `phone` varchar(10) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `city_id` int DEFAULT NULL,
  `vendor_id` int DEFAULT NULL,
  `management_fee` text COLLATE utf8mb4_unicode_ci,
  `is_active` tinyint(1) DEFAULT '1',
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_recruiter_email` (`email`(255)),
  KEY `city_id` (`city_id`),
  KEY `vendor_id` (`vendor_id`),
  CONSTRAINT `recruiters_ibfk_1` FOREIGN KEY (`city_id`) REFERENCES `cities` (`id`) ON DELETE SET NULL,
  CONSTRAINT `recruiters_ibfk_2` FOREIGN KEY (`vendor_id`) REFERENCES `vendors` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `recruiters`
--

LOCK TABLES `recruiters` WRITE;
/*!40000 ALTER TABLE `recruiters` DISABLE KEYS */;
INSERT INTO `recruiters` VALUES (1,'Joydeep','Joydeep.baidyayz@yulu.bike','9999999999',NULL,NULL,NULL,1,'2025-10-28 05:04:38');
/*!40000 ALTER TABLE `recruiters` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `roles`
--

DROP TABLE IF EXISTS `roles`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `roles` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `code` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `job_description_file` text COLLATE utf8mb4_unicode_ci,
  `paygroup_id` int DEFAULT NULL,
  `business_unit_id` int DEFAULT NULL,
  `department_id` int DEFAULT NULL,
  `sub_department_id` int DEFAULT NULL,
  `skill_level` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `level` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `is_active` tinyint(1) DEFAULT '1',
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `code` (`code`),
  UNIQUE KEY `code_2` (`code`),
  KEY `paygroup_id` (`paygroup_id`),
  KEY `business_unit_id` (`business_unit_id`),
  KEY `department_id` (`department_id`),
  KEY `sub_department_id` (`sub_department_id`),
  KEY `idx_skill_level` (`skill_level`),
  KEY `idx_level` (`level`),
  CONSTRAINT `roles_ibfk_1` FOREIGN KEY (`paygroup_id`) REFERENCES `functions` (`id`) ON DELETE SET NULL,
  CONSTRAINT `roles_ibfk_2` FOREIGN KEY (`business_unit_id`) REFERENCES `business_units` (`id`) ON DELETE SET NULL,
  CONSTRAINT `roles_ibfk_3` FOREIGN KEY (`department_id`) REFERENCES `departments` (`id`) ON DELETE SET NULL,
  CONSTRAINT `roles_ibfk_4` FOREIGN KEY (`sub_department_id`) REFERENCES `sub_departments` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB AUTO_INCREMENT=27 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `roles`
--

LOCK TABLES `roles` WRITE;
/*!40000 ALTER TABLE `roles` DISABLE KEYS */;
INSERT INTO `roles` VALUES (1,'Quality Check Associate','QCA',NULL,1,1,1,3,'Semi-Skilled',NULL,1,'2025-10-23 00:01:15'),(2,'Workshop Manager','WM',NULL,1,1,1,3,'Skilled',NULL,1,'2025-10-27 22:18:53'),(3,'Workshop Technician','WT',NULL,1,1,1,3,'Semi-Skilled',NULL,1,'2025-10-27 22:31:33'),(4,'Bike Captain','BC',NULL,1,1,1,3,'Semi-Skilled',NULL,1,'2025-10-27 22:32:19'),(5,'Bike Fitter','BF',NULL,1,1,1,3,'Semi-Skilled',NULL,1,'2025-10-27 22:33:15'),(6,'Bike Washer','BW',NULL,1,1,1,3,'Unskilled',NULL,1,'2025-10-27 22:33:46'),(7,'Inventory Associate','IA',NULL,1,1,1,3,'Semi-Skilled',NULL,1,'2025-10-27 22:34:06'),(8,'Marshal','ML',NULL,1,1,1,3,'Semi-Skilled',NULL,1,'2025-10-27 22:34:30'),(9,'Operator','OP',NULL,1,1,1,4,'Unskilled',NULL,1,'2025-10-27 22:34:54'),(10,'PDI Technician','PDI',NULL,1,1,1,3,'Semi-Skilled',NULL,1,'2025-10-27 22:38:08'),(11,'Pilot','PL',NULL,1,1,1,7,'Unskilled',NULL,1,'2025-10-27 22:38:29'),(12,'Yulu Promoter','YP',NULL,1,1,1,5,'Semi-Skilled',NULL,1,'2025-10-27 22:38:57'),(13,'RSA Captain','RSAC',NULL,1,1,1,3,'Semi-Skilled',NULL,1,'2025-10-27 23:15:18'),(14,'RSA Pilot','RSAP',NULL,1,1,1,3,'Semi-Skilled',NULL,1,'2025-10-27 23:15:48'),(15,'Yulu Captain','YC',NULL,1,1,1,3,'Semi-Skilled',NULL,1,'2025-10-27 23:23:12'),(16,'Zone Screener','ZS',NULL,1,1,1,7,'Unskilled',NULL,1,'2025-10-27 23:32:15'),(17,'Telecaller','TL',NULL,1,1,1,5,'Unskilled',NULL,1,'2025-10-27 23:33:20'),(18,'Welder','WL',NULL,1,1,1,3,'Unskilled',NULL,1,'2025-10-27 23:46:22'),(19,'Refurbishment Associate','RA',NULL,1,1,1,3,'Semi-Skilled',NULL,1,'2025-10-27 23:46:46'),(20,'Warehouse Associate','WA',NULL,1,1,1,3,'Semi-Skilled',NULL,1,'2025-10-27 23:47:18'),(21,'Technician','TC',NULL,1,1,5,NULL,'Skilled',NULL,1,'2025-10-27 23:51:19'),(22,'IOT Technician','ITC',NULL,1,1,4,NULL,'Skilled',NULL,1,'2025-10-27 23:59:08'),(23,'Senior Technician','STC',NULL,1,1,5,NULL,'Skilled',NULL,1,'2025-10-28 00:02:03'),(24,'Sales Associate','SA',NULL,1,1,1,5,'Semi-Skilled',NULL,1,'2025-10-28 00:03:45'),(25,'Cluster  Promotion Executive','CPE',NULL,1,1,1,5,'Semi-Skilled',NULL,1,'2025-10-28 00:04:22'),(26,'TL  Rider Enabelment','TRE',NULL,1,1,8,NULL,'Semi-Skilled',NULL,1,'2025-10-28 02:32:38');
/*!40000 ALTER TABLE `roles` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `sub_departments`
--

DROP TABLE IF EXISTS `sub_departments`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `sub_departments` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `code` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `department_id` int DEFAULT NULL,
  `is_active` tinyint(1) DEFAULT '1',
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `code` (`code`),
  UNIQUE KEY `code_2` (`code`),
  KEY `department_id` (`department_id`),
  CONSTRAINT `sub_departments_ibfk_1` FOREIGN KEY (`department_id`) REFERENCES `departments` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB AUTO_INCREMENT=9 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `sub_departments`
--

LOCK TABLES `sub_departments` WRITE;
/*!40000 ALTER TABLE `sub_departments` DISABLE KEYS */;
INSERT INTO `sub_departments` VALUES (1,'Learning And Developments','L&D',2,1,'2025-10-23 01:07:36'),(2,'TA  & People Operations','TA & People Ops',3,1,'2025-10-23 01:22:17'),(3,'Repair and Maintenance','R&M',1,1,'2025-10-23 01:30:11'),(4,'Relocation And Recovery','R&R',1,1,'2025-10-23 01:34:01'),(5,'Business Development','BD',1,1,'2025-10-23 01:40:57'),(6,'Sourcing Specalist','SS',3,1,'2025-10-23 01:46:10'),(7,'Screening and Swapping','S&SW',1,1,'2025-10-23 01:51:48');
/*!40000 ALTER TABLE `sub_departments` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `trainers`
--

DROP TABLE IF EXISTS `trainers`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `trainers` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `city_id` int DEFAULT NULL,
  `email` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `phone` varchar(15) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `is_active` tinyint(1) DEFAULT '1',
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `city_id` (`city_id`),
  CONSTRAINT `trainers_ibfk_1` FOREIGN KEY (`city_id`) REFERENCES `cities` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `trainers`
--

LOCK TABLES `trainers` WRITE;
/*!40000 ALTER TABLE `trainers` DISABLE KEYS */;
INSERT INTO `trainers` VALUES (1,'Rajesh Kumar',1,'rajesh.updated@training.com','9999999999',1,'2025-10-28 13:15:47','2025-10-28 13:32:45'),(2,'Priya Sharma',3,'priya.sharma@training.com','9876543211',1,'2025-10-28 13:15:47','2025-10-28 13:15:47'),(3,'Amit Patel',1,'amit.patel@training.com','9876543212',1,'2025-10-28 13:15:47','2025-10-28 15:30:49');
/*!40000 ALTER TABLE `trainers` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `user_audit_trail`
--

DROP TABLE IF EXISTS `user_audit_trail`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `user_audit_trail` (
  `id` int NOT NULL AUTO_INCREMENT,
  `user_id` int NOT NULL,
  `changed_by` int NOT NULL,
  `change_type` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `table_name` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `record_id` int NOT NULL,
  `old_values` json DEFAULT NULL,
  `new_values` json DEFAULT NULL,
  `timestamp` datetime DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `user_id` (`user_id`),
  KEY `changed_by` (`changed_by`),
  CONSTRAINT `user_audit_trail_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  CONSTRAINT `user_audit_trail_ibfk_2` FOREIGN KEY (`changed_by`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=92 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `user_audit_trail`
--

LOCK TABLES `user_audit_trail` WRITE;
/*!40000 ALTER TABLE `user_audit_trail` DISABLE KEYS */;
INSERT INTO `user_audit_trail` VALUES (27,5,5,'LOGIN','users',5,NULL,'{\"loginTime\": \"2025-09-08T19:14:28.432Z\"}','2025-09-09 00:44:28'),(28,5,5,'LOGIN','users',5,NULL,'{\"loginTime\": \"2025-09-08T19:39:38.682Z\"}','2025-09-09 01:09:38'),(29,5,5,'LOGIN','users',5,NULL,'{\"loginTime\": \"2025-09-08T19:45:07.133Z\"}','2025-09-09 01:15:07'),(30,5,5,'LOGIN','users',5,NULL,'{\"loginTime\": \"2025-09-08T19:45:20.207Z\"}','2025-09-09 01:15:20'),(31,5,5,'LOGIN','users',5,NULL,'{\"loginTime\": \"2025-09-10T11:56:16.030Z\"}','2025-09-10 17:26:16'),(32,5,5,'LOGIN','users',5,NULL,'{\"loginTime\": \"2025-09-10T16:52:35.347Z\"}','2025-09-10 22:22:35'),(33,5,5,'LOGIN','users',5,NULL,'{\"loginTime\": \"2025-09-10T17:44:48.700Z\"}','2025-09-10 23:14:48'),(34,5,5,'LOGIN','users',5,NULL,'{\"loginTime\": \"2025-09-10T17:57:36.117Z\"}','2025-09-10 23:27:36'),(35,5,5,'LOGIN','users',5,NULL,'{\"loginTime\": \"2025-09-10T18:18:47.529Z\"}','2025-09-10 23:48:47'),(36,5,5,'LOGIN','users',5,NULL,'{\"loginTime\": \"2025-09-11T04:04:51.327Z\"}','2025-09-11 09:34:51'),(37,5,5,'LOGIN','users',5,NULL,'{\"loginTime\": \"2025-09-11T04:06:50.194Z\"}','2025-09-11 09:36:50'),(38,7,7,'LOGIN','users',7,NULL,'{\"loginTime\": \"2025-09-11T04:07:49.246Z\"}','2025-09-11 09:37:49'),(39,8,8,'LOGIN','users',8,NULL,'{\"loginTime\": \"2025-09-11T04:11:10.287Z\"}','2025-09-11 09:41:10'),(40,5,5,'LOGIN','users',5,NULL,'{\"loginTime\": \"2025-09-12T17:30:27.237Z\"}','2025-09-12 23:00:27'),(41,5,5,'LOGIN','users',5,NULL,'{\"loginTime\": \"2025-09-12T19:07:36.320Z\"}','2025-09-13 00:37:36'),(42,5,5,'LOGIN','users',5,NULL,'{\"loginTime\": \"2025-09-12T19:08:49.077Z\"}','2025-09-13 00:38:49'),(43,5,5,'LOGIN','users',5,NULL,'{\"loginTime\": \"2025-09-12T20:04:59.276Z\"}','2025-09-13 01:34:59'),(44,5,5,'LOGIN','users',5,NULL,'{\"loginTime\": \"2025-09-12T20:10:49.808Z\"}','2025-09-13 01:40:49'),(45,5,5,'LOGIN','users',5,NULL,'{\"loginTime\": \"2025-09-18T20:36:28.804Z\"}','2025-09-19 02:06:28'),(46,5,5,'LOGIN','users',5,NULL,'{\"loginTime\": \"2025-09-18T20:50:09.425Z\"}','2025-09-19 02:20:09'),(47,5,5,'LOGIN','users',5,NULL,'{\"loginTime\": \"2025-09-18T20:55:21.141Z\"}','2025-09-19 02:25:21'),(48,5,5,'LOGIN','users',5,NULL,'{\"loginTime\": \"2025-09-21T13:59:30.659Z\"}','2025-09-21 19:29:30'),(49,5,5,'LOGIN','users',5,NULL,'{\"loginTime\": \"2025-09-24T10:33:11.558Z\"}','2025-09-24 16:03:11'),(50,5,5,'LOGIN','users',5,NULL,'{\"loginTime\": \"2025-09-25T17:12:34.453Z\"}','2025-09-25 22:42:34'),(51,5,5,'LOGIN','users',5,NULL,'{\"loginTime\": \"2025-09-28T17:26:29.506Z\"}','2025-09-28 22:56:29'),(52,5,5,'LOGIN','users',5,NULL,'{\"loginTime\": \"2025-10-01T09:06:07.556Z\"}','2025-10-01 14:36:07'),(53,5,5,'LOGIN','users',5,NULL,'{\"loginTime\": \"2025-10-03T07:19:48.924Z\"}','2025-10-03 12:49:48'),(54,5,5,'LOGIN','users',5,NULL,'{\"loginTime\": \"2025-10-03T07:33:13.954Z\"}','2025-10-03 13:03:13'),(55,5,5,'LOGIN','users',5,NULL,'{\"loginTime\": \"2025-10-06T18:14:08.532Z\"}','2025-10-06 23:44:08'),(56,5,5,'LOGIN','users',5,NULL,'{\"loginTime\": \"2025-10-09T17:54:57.852Z\"}','2025-10-09 23:24:57'),(57,5,5,'LOGIN','users',5,NULL,'{\"loginTime\": \"2025-10-09T18:01:06.695Z\"}','2025-10-09 23:31:06'),(58,5,5,'LOGIN','users',5,NULL,'{\"loginTime\": \"2025-10-13T18:50:15.586Z\"}','2025-10-14 00:20:15'),(59,5,5,'LOGIN','users',5,NULL,'{\"loginTime\": \"2025-10-13T19:01:04.895Z\"}','2025-10-14 00:31:04'),(60,5,5,'LOGIN','users',5,NULL,'{\"loginTime\": \"2025-10-13T19:04:08.375Z\"}','2025-10-14 00:34:08'),(61,5,5,'LOGIN','users',5,NULL,'{\"loginTime\": \"2025-10-13T19:05:14.287Z\"}','2025-10-14 00:35:14'),(62,5,5,'LOGIN','users',5,NULL,'{\"loginTime\": \"2025-10-14T02:29:47.748Z\"}','2025-10-14 07:59:47'),(63,5,5,'LOGIN','users',5,NULL,'{\"loginTime\": \"2025-10-14T02:30:31.230Z\"}','2025-10-14 08:00:31'),(64,5,5,'LOGIN','users',5,NULL,'{\"loginTime\": \"2025-10-16T13:20:04.158Z\"}','2025-10-16 18:50:04'),(65,5,5,'LOGIN','users',5,NULL,'{\"loginTime\": \"2025-10-20T12:03:36.813Z\"}','2025-10-20 17:33:36'),(66,5,5,'LOGIN','users',5,NULL,'{\"loginTime\": \"2025-10-22T12:05:58.615Z\"}','2025-10-22 17:35:58'),(67,1,1,'LOGIN','users',1,NULL,'{\"loginTime\": \"2025-10-22T17:27:24.816Z\"}','2025-10-22 22:57:24'),(68,1,1,'LOGIN','users',1,NULL,'{\"loginTime\": \"2025-10-27T15:54:21.845Z\"}','2025-10-27 21:24:21'),(69,1,1,'LOGIN','users',1,NULL,'{\"loginTime\": \"2025-10-30T09:01:17.630Z\"}','2025-10-30 14:31:17'),(70,1,1,'LOGIN','users',1,NULL,'{\"loginTime\": \"2025-11-02T20:06:49.002Z\"}','2025-11-03 01:36:49'),(71,1,1,'LOGIN','users',1,NULL,'{\"loginTime\": \"2025-11-06T04:36:23.176Z\"}','2025-11-06 10:06:23'),(72,1,1,'LOGIN','users',1,NULL,'{\"loginTime\": \"2025-11-07T04:40:08.400Z\"}','2025-11-07 10:10:08'),(73,1,1,'LOGIN','users',1,NULL,'{\"loginTime\": \"2025-11-08T20:58:46.292Z\"}','2025-11-09 02:28:46'),(74,1,1,'LOGIN','users',1,NULL,'{\"loginTime\": \"2025-11-10T03:05:17.352Z\"}','2025-11-10 08:35:17'),(75,1,1,'LOGIN','users',1,NULL,'{\"loginTime\": \"2025-11-11T09:08:07.773Z\"}','2025-11-11 14:38:07'),(76,1,1,'LOGIN','users',1,NULL,'{\"loginTime\": \"2025-11-11T18:30:27.242Z\"}','2025-11-12 00:00:27'),(77,1,1,'LOGIN','users',1,NULL,'{\"loginTime\": \"2025-11-11T19:47:14.729Z\"}','2025-11-12 01:17:14'),(78,1,1,'LOGIN','users',1,NULL,'{\"loginTime\": \"2025-11-13T12:36:17.526Z\"}','2025-11-13 18:06:17'),(79,1,1,'LOGIN','users',1,NULL,'{\"loginTime\": \"2025-11-16T16:31:14.338Z\"}','2025-11-16 22:01:14'),(80,1,1,'LOGIN','users',1,NULL,'{\"loginTime\": \"2025-11-16T17:28:29.714Z\"}','2025-11-16 22:58:29'),(81,1,1,'LOGIN','users',1,NULL,'{\"loginTime\": \"2025-11-16T21:50:16.371Z\"}','2025-11-17 03:20:16'),(82,1,1,'LOGIN','users',1,NULL,'{\"loginTime\": \"2025-11-16T22:11:33.991Z\"}','2025-11-17 03:41:33'),(83,1,1,'LOGIN','users',1,NULL,'{\"loginTime\": \"2025-11-17T04:17:47.677Z\"}','2025-11-17 09:47:47'),(84,1,1,'LOGIN','users',1,NULL,'{\"loginTime\": \"2025-11-18T19:43:46.071Z\"}','2025-11-19 01:13:46'),(85,1,1,'LOGIN','users',1,NULL,'{\"loginTime\": \"2025-11-20T03:43:58.933Z\"}','2025-11-20 09:13:58'),(86,1,1,'LOGIN','users',1,NULL,'{\"loginTime\": \"2025-11-25T17:45:08.648Z\"}','2025-11-25 23:15:08'),(87,1,1,'LOGIN','users',1,NULL,'{\"loginTime\": \"2025-11-26T02:43:21.889Z\"}','2025-11-26 08:13:21'),(88,1,1,'LOGIN','users',1,NULL,'{\"loginTime\": \"2025-11-26T02:54:23.033Z\"}','2025-11-26 08:24:23'),(89,1,1,'LOGIN','users',1,NULL,'{\"loginTime\": \"2025-11-26T02:58:54.060Z\"}','2025-11-26 08:28:54'),(90,1,1,'LOGIN','users',1,NULL,'{\"loginTime\": \"2025-11-26T12:55:32.077Z\"}','2025-11-26 18:25:32'),(91,1,1,'LOGIN','users',1,NULL,'{\"loginTime\": \"2025-11-26T17:38:59.801Z\"}','2025-11-26 23:08:59');
/*!40000 ALTER TABLE `user_audit_trail` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `users`
--

DROP TABLE IF EXISTS `users`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `users` (
  `id` int NOT NULL AUTO_INCREMENT,
  `email` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `name` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `phone` varchar(10) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `user_id` int NOT NULL,
  `password` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `role` enum('admin','hr','recruiter','manager','trainer') COLLATE utf8mb4_unicode_ci NOT NULL,
  `manager_id` int DEFAULT NULL,
  `city_id` int DEFAULT NULL,
  `cluster_id` int DEFAULT NULL,
  `is_active` tinyint(1) DEFAULT '1',
  `last_login` datetime DEFAULT NULL,
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `user_id` (`user_id`),
  UNIQUE KEY `unique_user_email` (`email`(255)),
  KEY `manager_id` (`manager_id`),
  KEY `city_id` (`city_id`),
  KEY `cluster_id` (`cluster_id`),
  CONSTRAINT `users_ibfk_1` FOREIGN KEY (`manager_id`) REFERENCES `users` (`id`) ON DELETE SET NULL,
  CONSTRAINT `users_ibfk_2` FOREIGN KEY (`city_id`) REFERENCES `cities` (`id`) ON DELETE SET NULL,
  CONSTRAINT `users_ibfk_3` FOREIGN KEY (`cluster_id`) REFERENCES `clusters` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `users`
--

LOCK TABLES `users` WRITE;
/*!40000 ALTER TABLE `users` DISABLE KEYS */;
INSERT INTO `users` VALUES (1,'admin@hrms.com','Admin User','9999999999',1001,'$2b$10$W/UY/4TmlYrF3MidQXOL1eom2bfBUpp1vbhxvkyAtbd1XkYzrrCcy','admin',NULL,1,NULL,1,NULL,'2025-10-22 22:56:51','2025-11-26 08:17:52');
/*!40000 ALTER TABLE `users` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `vendors`
--

DROP TABLE IF EXISTS `vendors`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `vendors` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `code` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `management_fees` decimal(5,2) DEFAULT NULL,
  `sourcing_fee` decimal(10,2) DEFAULT NULL,
  `replacement_days` int DEFAULT NULL,
  `delivery_lead_name` text COLLATE utf8mb4_unicode_ci,
  `delivery_lead_email` text COLLATE utf8mb4_unicode_ci,
  `delivery_lead_phone` varchar(15) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `business_head_name` text COLLATE utf8mb4_unicode_ci,
  `business_head_email` text COLLATE utf8mb4_unicode_ci,
  `business_head_phone` varchar(15) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `payroll_spoc_name` text COLLATE utf8mb4_unicode_ci,
  `payroll_spoc_email` text COLLATE utf8mb4_unicode_ci,
  `payroll_spoc_phone` varchar(15) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `city_spocs` json DEFAULT NULL,
  `is_active` tinyint(1) DEFAULT '1',
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=8 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `vendors`
--

LOCK TABLES `vendors` WRITE;
/*!40000 ALTER TABLE `vendors` DISABLE KEYS */;
INSERT INTO `vendors` VALUES (7,'Xpheno','XPH',10.50,5000.00,45,'Anila','anila.s@xpheno.com','8976543210','Divya Kurup','divya.kuru@xpheno.com','9739022399','Neetha','neetha.s@xpheno.com','8867701392','{\"city_spoc_1_name\": \"Anila\", \"city_spoc_3_name\": \"Shailendra pal\", \"city_spoc_6_name\": \"Vikas Sans\", \"city_spoc_1_email\": \"anila.s@xpheno.com\", \"city_spoc_1_phone\": \"8123722038\", \"city_spoc_3_email\": \"shailendra.p@xpheno.com\", \"city_spoc_3_phone\": \"9990154994\", \"city_spoc_6_email\": \"vikas.s@xpheno.com\", \"city_spoc_6_phone\": \"9833072375\"}',1,'2025-10-28 05:21:55','2025-10-28 13:05:39');
/*!40000 ALTER TABLE `vendors` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2025-11-27  0:04:29
