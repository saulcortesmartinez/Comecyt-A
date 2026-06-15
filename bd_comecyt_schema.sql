-- MariaDB dump 10.19  Distrib 10.4.28-MariaDB, for osx10.10 (x86_64)
--
-- Host: localhost    Database: bd_comecyt
-- ------------------------------------------------------
-- Server version	10.4.28-MariaDB

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
-- Table structure for table `ADMINISTRADOR`
--

DROP TABLE IF EXISTS `ADMINISTRADOR`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `ADMINISTRADOR` (
  `admin_id` int(11) NOT NULL AUTO_INCREMENT,
  `nombre` varchar(100) DEFAULT NULL,
  `apellido` varchar(100) DEFAULT NULL,
  `usuario` varchar(100) NOT NULL,
  `contraseña` varchar(255) NOT NULL,
  `fecha_registro` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`admin_id`),
  UNIQUE KEY `usuario` (`usuario`)
) ENGINE=InnoDB AUTO_INCREMENT=11 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `ALUMNO`
--

DROP TABLE IF EXISTS `ALUMNO`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `ALUMNO` (
  `alumno_id` int(11) NOT NULL AUTO_INCREMENT,
  `nombre` varchar(100) NOT NULL,
  `apellido` varchar(100) NOT NULL,
  `correo` varchar(150) NOT NULL,
  `contraseña` varchar(255) NOT NULL,
  `progreso_m1` int(11) DEFAULT 0,
  `progreso_m2` int(11) DEFAULT 0,
  `progreso_m3` int(11) DEFAULT 0,
  `telefono` varchar(20) DEFAULT NULL,
  `progreso_m4` int(11) DEFAULT 0,
  `progreso_m5` int(11) DEFAULT 0,
  PRIMARY KEY (`alumno_id`),
  UNIQUE KEY `correo` (`correo`)
) ENGINE=InnoDB AUTO_INCREMENT=48 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `CERTIFICADO`
--

DROP TABLE IF EXISTS `CERTIFICADO`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `CERTIFICADO` (
  `certificado_id` int(11) NOT NULL AUTO_INCREMENT,
  `alumno_id` int(11) NOT NULL,
  `modulo_id` int(11) NOT NULL,
  `ruta_certificado` varchar(300) DEFAULT NULL,
  `fecha_emision` datetime DEFAULT current_timestamp(),
  PRIMARY KEY (`certificado_id`),
  UNIQUE KEY `uq_alumno_modulo` (`alumno_id`,`modulo_id`),
  KEY `modulo_id` (`modulo_id`),
  CONSTRAINT `certificado_ibfk_1` FOREIGN KEY (`alumno_id`) REFERENCES `ALUMNO` (`alumno_id`),
  CONSTRAINT `certificado_ibfk_2` FOREIGN KEY (`modulo_id`) REFERENCES `MODULO` (`modulo_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `CONTENIDO`
--

DROP TABLE IF EXISTS `CONTENIDO`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `CONTENIDO` (
  `contenido_id` int(11) NOT NULL AUTO_INCREMENT,
  `modulo_id` int(11) NOT NULL,
  `numero` int(11) NOT NULL,
  `titulo` varchar(200) NOT NULL,
  `tipo` enum('contenido','evaluacion') DEFAULT 'contenido',
  PRIMARY KEY (`contenido_id`),
  KEY `modulo_id` (`modulo_id`),
  CONSTRAINT `contenido_ibfk_1` FOREIGN KEY (`modulo_id`) REFERENCES `MODULO` (`modulo_id`)
) ENGINE=InnoDB AUTO_INCREMENT=134 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `DOCENTE`
--

DROP TABLE IF EXISTS `DOCENTE`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `DOCENTE` (
  `docente_id` int(11) NOT NULL AUTO_INCREMENT,
  `nombre` varchar(100) NOT NULL,
  `apellido` varchar(100) NOT NULL,
  `correo` varchar(150) NOT NULL,
  `contraseña` varchar(255) NOT NULL,
  `telefono` varchar(20) DEFAULT NULL,
  PRIMARY KEY (`docente_id`),
  UNIQUE KEY `correo` (`correo`)
) ENGINE=InnoDB AUTO_INCREMENT=8 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `EVALUACION`
--

DROP TABLE IF EXISTS `EVALUACION`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `EVALUACION` (
  `evaluacion_id` int(11) NOT NULL AUTO_INCREMENT,
  `modulo_id` int(11) NOT NULL,
  `docente_id` int(11) DEFAULT NULL,
  `titulo` varchar(200) NOT NULL,
  `puntaje` int(11) NOT NULL DEFAULT 15,
  PRIMARY KEY (`evaluacion_id`),
  KEY `modulo_id` (`modulo_id`),
  KEY `docente_id` (`docente_id`),
  CONSTRAINT `evaluacion_ibfk_1` FOREIGN KEY (`modulo_id`) REFERENCES `MODULO` (`modulo_id`),
  CONSTRAINT `evaluacion_ibfk_2` FOREIGN KEY (`docente_id`) REFERENCES `DOCENTE` (`docente_id`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `MODULO`
--

DROP TABLE IF EXISTS `MODULO`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `MODULO` (
  `modulo_id` int(11) NOT NULL AUTO_INCREMENT,
  `titulo` varchar(200) NOT NULL,
  `descripcion` text DEFAULT NULL,
  `total_contenidos` int(11) NOT NULL DEFAULT 0,
  PRIMARY KEY (`modulo_id`)
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `REPORTE`
--

DROP TABLE IF EXISTS `REPORTE`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `REPORTE` (
  `reporte_id` int(11) NOT NULL AUTO_INCREMENT,
  `docente_id` int(11) NOT NULL,
  `contenido` text DEFAULT NULL,
  `fecha` datetime DEFAULT current_timestamp(),
  PRIMARY KEY (`reporte_id`),
  KEY `docente_id` (`docente_id`),
  CONSTRAINT `reporte_ibfk_1` FOREIGN KEY (`docente_id`) REFERENCES `DOCENTE` (`docente_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `RESULTADO`
--

DROP TABLE IF EXISTS `RESULTADO`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `RESULTADO` (
  `resultado_id` int(11) NOT NULL AUTO_INCREMENT,
  `evaluacion_id` int(11) NOT NULL,
  `alumno_id` int(11) NOT NULL,
  `puntaje` int(11) NOT NULL,
  `fecha` datetime DEFAULT current_timestamp(),
  PRIMARY KEY (`resultado_id`),
  KEY `evaluacion_id` (`evaluacion_id`),
  KEY `alumno_id` (`alumno_id`),
  CONSTRAINT `resultado_ibfk_1` FOREIGN KEY (`evaluacion_id`) REFERENCES `EVALUACION` (`evaluacion_id`),
  CONSTRAINT `resultado_ibfk_2` FOREIGN KEY (`alumno_id`) REFERENCES `ALUMNO` (`alumno_id`)
) ENGINE=InnoDB AUTO_INCREMENT=12 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `becas`
--

DROP TABLE IF EXISTS `becas`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `becas` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `nombre` varchar(255) DEFAULT NULL,
  `fecha_inicio` date DEFAULT NULL,
  `requisitos` text DEFAULT NULL,
  `estatus` enum('activa','cerrada') DEFAULT 'activa',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `contenidos_completados`
--

DROP TABLE IF EXISTS `contenidos_completados`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `contenidos_completados` (
  `correo` varchar(255) NOT NULL,
  `modulo_id` int(11) NOT NULL,
  `contenido_id` int(11) NOT NULL,
  `fecha_completado` datetime DEFAULT current_timestamp(),
  PRIMARY KEY (`correo`,`modulo_id`,`contenido_id`),
  UNIQUE KEY `unico_contenido` (`correo`,`modulo_id`,`contenido_id`),
  KEY `modulo_id` (`modulo_id`),
  CONSTRAINT `contenidos_completados_ibfk_1` FOREIGN KEY (`modulo_id`) REFERENCES `MODULO` (`modulo_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `dudas_whatsapp`
--

DROP TABLE IF EXISTS `dudas_whatsapp`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `dudas_whatsapp` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `telefono` varchar(20) NOT NULL,
  `pregunta` text NOT NULL,
  `fecha` datetime DEFAULT current_timestamp(),
  `estatus` enum('nueva','respondida','cerrada') DEFAULT 'nueva',
  `nombre` varchar(100) DEFAULT 'Usuario WhatsApp',
  `modulo` varchar(50) DEFAULT '/whatsapp',
  `respuesta` text DEFAULT NULL,
  `fecha_respuesta` datetime DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=38 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `mensajes_whatsapp`
--

DROP TABLE IF EXISTS `mensajes_whatsapp`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `mensajes_whatsapp` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `telefono` varchar(20) DEFAULT NULL,
  `mensaje` text DEFAULT NULL,
  `fecha` datetime DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=62 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `progreso`
--

DROP TABLE IF EXISTS `progreso`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `progreso` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `correo` varchar(255) NOT NULL,
  `modulo_id` int(11) NOT NULL,
  `progreso_actual` int(11) DEFAULT 0,
  `fecha_update` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_usuario_modulo` (`correo`,`modulo_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `progreso_modulos`
--

DROP TABLE IF EXISTS `progreso_modulos`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `progreso_modulos` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `correo` varchar(100) NOT NULL,
  `modulo_id` int(11) NOT NULL,
  `progreso_actual` int(11) NOT NULL DEFAULT 0,
  `fecha_actualizacion` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_alumno_modulo` (`correo`,`modulo_id`),
  UNIQUE KEY `unique_correo_modulo` (`correo`,`modulo_id`),
  UNIQUE KEY `unique_usuario_modulo` (`correo`,`modulo_id`),
  KEY `modulo_id` (`modulo_id`),
  CONSTRAINT `progreso_modulos_ibfk_1` FOREIGN KEY (`correo`) REFERENCES `ALUMNO` (`correo`) ON DELETE CASCADE,
  CONSTRAINT `progreso_modulos_ibfk_2` FOREIGN KEY (`modulo_id`) REFERENCES `MODULO` (`modulo_id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=548 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `usuarios`
--

DROP TABLE IF EXISTS `usuarios`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `usuarios` (
  `alumno_id` int(11) NOT NULL AUTO_INCREMENT,
  `nombre` varchar(100) NOT NULL,
  `apellido` varchar(100) NOT NULL,
  `correo` varchar(150) NOT NULL,
  `contraseña` varchar(255) NOT NULL,
  `rol` varchar(50) DEFAULT 'alumno',
  `avatar` varchar(255) DEFAULT NULL,
  `fecha_registro` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`alumno_id`),
  UNIQUE KEY `correo` (`correo`)
) ENGINE=InnoDB AUTO_INCREMENT=14 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-06-15 14:58:15
