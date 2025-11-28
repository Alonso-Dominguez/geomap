PRAGMA foreign_keys = ON;

-- Tabla del Rol
CREATE TABLE IF NOT EXISTS rol (
    id_rol INTEGER PRIMARY KEY AUTOINCREMENT,
    nombre_rol VARCHAR(20) NOT NULL
);

-- Tabla de Usuarios y Administradores
CREATE TABLE IF NOT EXISTS usuarios_ga (
    id_usuario INTEGER PRIMARY KEY AUTOINCREMENT,
    usuario VARCHAR(100) UNIQUE,
    email VARCHAR(100) UNIQUE,
    password VARCHAR(200),
    fecha_registro DATETIME DEFAULT CURRENT_TIMESTAMP,
    id_rol INTEGER DEFAULT 1,
    FOREIGN KEY (id_rol) REFERENCES rol (id_rol)
);

-- Tabla de Estados
CREATE TABLE IF NOT EXISTS estado_ga(
    id_estado INTEGER PRIMARY KEY AUTOINCREMENT,
    nombre_e varchar(80)
);

-- Tabla de Municipios
CREATE TABLE IF NOT EXISTS municipio_ga(
    id_municipio INTEGER PRIMARY KEY AUTOINCREMENT,
    id_estado INTEGER,
    nombre_m VARCHAR(100),
    FOREIGN KEY (id_estado) REFERENCES estado_ga(id_estado)
);

-- Tabla de Citas
CREATE TABLE IF NOT EXISTS citas_ga(
    id_cita INTEGER PRIMARY KEY AUTOINCREMENT,
    telefono_c TEXT,
    fecha_c DATETIME,
    id_usuario INTEGER,
    FOREIGN KEY (id_usuario) REFERENCES usuarios_ga(id_usuario)
);

-- Tabla de Resultados
CREATE TABLE IF NOT EXISTS resultados_ga(
    id_resultado INTEGER PRIMARY KEY AUTOINCREMENT,
    pdf TEXT,
    calificacion INTEGER CHECK (calificacion BETWEEN 0 AND 100),
    resultados_preguntas TEXT
);

-- Datos iniciales
INSERT OR IGNORE INTO rol (id_rol, nombre_rol) VALUES (1, 'user');
INSERT OR IGNORE INTO rol (id_rol, nombre_rol) VALUES (2, 'admin');

INSERT OR IGNORE INTO estado_ga (id_estado, nombre_e) VALUES (1, 'Hidalgo');

INSERT OR IGNORE INTO municipio_ga (id_municipio, id_estado, nombre_m) VALUES
(1,1, 'Acatlán'),
(2,1, 'Acaxochitlán'),
(3,1, 'Actopan'),
(4,1, 'Agua Blanca de Iturbide'),
(5,1, 'Ajacuba'),
(6,1, 'Alfajayucan'),
(7,1, 'Almoloya'),
(8,1, 'Apan'),
(9,1, 'Atitalaquia'),
(10,1, 'Atlapexco'),
(11,1, 'Atotonilco el Grande'),
(12,1, 'Atotonilco de Tula'),
(13,1, 'Calnali'),
(14,1, 'Cardonal'),
(15,1, 'Cuautepec de Hinojosa'),
(16,1, 'Chapantongo'),
(17,1, 'Chapulhuacán'),
(18,1, 'Chilcuautla'),
(19,1, 'El Arenal'),
(20,1, 'Eloxochitlán'),
(21,1, 'Emiliano Zapata'),
(22,1, 'Epazoyucan'),
(23,1, 'Francisco I. Madero'),
(24,1, 'Huasca de Ocampo'),
(25,1, 'Huautla'),
(26,1, 'Huazalingo'),
(27,1, 'Huehuetla'),
(28,1, 'Huejutla de Reyes'),
(29,1, 'Huichapan'),
(30,1, 'Ixmiquilpan'),
(31,1, 'Jacala de Ledezma'),
(32,1, 'Jaltocán'),
(33,1, 'Juárez Hidalgo'),
(34,1, 'La Misión'),
(35,1, 'Lolotla'),
(36,1, 'Metepec'),
(37,1, 'Metztitlán'),
(38,1, 'Mineral del Chico'),
(39,1, 'Mineral del Monte'),
(40,1, 'Mineral de la Reforma'),
(41,1, 'Mixquiahuala de Juárez'),
(42,1, 'Molango de Escamilla'),
(43,1, 'Nicolás Flores'),
(44,1, 'Nopala de Villagrán'),
(45,1, 'Omitlán de Juárez'),
(46,1, 'Pacula'),
(47,1, 'Pachuca de Soto'),
(48,1, 'Pisaflores'),
(49,1, 'Progreso de Obregón'),
(50,1, 'San Agustín Metzquititlán'),
(51,1, 'San Agustín Tlaxiaca'),
(52,1, 'San Bartolo Tutotepec'),
(53,1, 'San Felipe Orizatlán'),
(54,1, 'San Salvador'),
(55,1, 'Santiago de Anaya'),
(56,1, 'Santiago Tulantepec de Lugo Guerrero'),
(57,1, 'Singuilucan'),
(58,1, 'Tasquillo'),
(59,1, 'Tecozautla'),
(60,1, 'Tenango de Doria'),
(61,1, 'Tepeapulco'),
(62,1, 'Tepehuacán de Guerrero'),
(63,1, 'Tepeji del Río de Ocampo'),
(64,1, 'Tepetitlán'),
(65,1, 'Tetepango'),
(66,1, 'Tezontepec de Aldama'),
(67,1, 'Tianguistengo'),
(68,1, 'Tizayuca'),
(69,1, 'Tlahuelilpan'),
(70,1, 'Tlahuiltepa'),
(71,1, 'Tlanalapa'),
(72,1, 'Tlanchinol'),
(73,1, 'Tlaxcoapan'),
(74,1, 'Tolcayuca'),
(75,1, 'Tula de Allende'),
(76,1, 'Tulancingo de Bravo'),
(77,1, 'Villa de Tezontepec'),
(78,1, 'Xochiatipan'),
(79,1, 'Xochicoatlán'),
(80,1, 'Yahualica'),
(81,1, 'Zacualtipán de Ángeles'),
(82,1, 'Zapotlán de Juárez'),
(83,1, 'Zempoala'),
(84,1, 'Zimapán');