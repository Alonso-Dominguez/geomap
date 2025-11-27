.headers on
.mode column
PRAGMA foreign_keys = ON;

-- Tabla de Usuarios y Administradores --
-- Se diferencia cada usuario por el rol que se le asigne --
CREATE TABLE usuaios_ga (
    id_usuario INTEGER PRIMARY KEY AUTOINCREMENT,
    nombre_u varchar(50),
    email_u varchar(50),
    contresena_u varchar(50),
    id_rol INT NOT NULL,
    FOREIGN KEY (id_rol) REFERENCES rol (id_rol)
);

-- Tabla del Rol--
-- Estan los roles para los usuario --
CREATE TABLE rol (
    id_rol INTEGER PRIMARY KEY AUTOINCREMENT,
    nombre_rol VARCHAR(7) NOT NULL
);

-- Tabla de Estados--
-- Se encuentran los estados --
CREATE TABLE estado_ga(
    id_estado INTEGER PRIMARY KEY AUTOINCREMENT,
    nombre_e varchar(20)
);

-- Tabla de Municipios--
--  --
CREATE TABLE municipio_ga(
    id_municipio INTEGER PRIMARY KEY AUTOINCREMENT,
    id_estado INTEGER,
    nombre_m VARCHAR(40),
    FOREIGN KEY (id_estado) REFERENCES estado_ga(id_estado)
);

CREATE TABLE citas_ga(
    id_cita INTEGER PRIMARY KEY AUTOINCREMENT,
    telefono_c TEXT,
    fecha_c DATETIME,
    id_usuario INTEGER,
    FOREIGN KEY (id_usuario) REFERENCES usuarios_ga(id_usuario)
);

CREATE TABLE resultados_ga(
    id_resultado INTEGER PRIMARY KEY AUTOINCREMENT,
    pdf TEXT,
    calificacion INTEGER CHECK (calificacion BETWEEN 0 AND 100),
    resultados_preguntas JSONB
);

INSERT INTO rol (nombre_rol) values ('user'),('admin');

INSERT INTO estado_ga (nombre_e) VALUES ('Hidalgo');

INSERT INTO municipio_ga (id_estado, nombre_m) VALUES
(1, 'Acatlán'),
(1, 'Acaxochitlán'),
(1, 'Actopan'),
(1, 'Agua Blanca de Iturbide'),
(1, 'Ajacuba'),
(1, 'Alfajayucan'),
(1, 'Almoloya'),
(1, 'Apan'),
(1, 'Atitalaquia'),
(1, 'Atlapexco'),
(1, 'Atotonilco el Grande'),
(1, 'Atotonilco de Tula'),
(1, 'Calnali'),
(1, 'Cardonal'),
(1, 'Cuautepec de Hinojosa'),
(1, 'Chapantongo'),
(1, 'Chapulhuacán'),
(1, 'Chilcuautla'),
(1, 'El Arenal'),
(1, 'Eloxochitlán'),
(1, 'Emiliano Zapata'),
(1, 'Epazoyucan'),
(1, 'Francisco I. Madero'),
(1, 'Huasca de Ocampo'),
(1, 'Huautla'),
(1, 'Huazalingo'),
(1, 'Huehuetla'),
(1, 'Huejutla de Reyes'),
(1, 'Huichapan'),
(1, 'Ixmiquilpan'),
(1, 'Jacala de Ledezma'),
(1, 'Jaltocán'),
(1, 'Juárez Hidalgo'),
(1, 'La Misión'),
(1, 'Lolotla'),
(1, 'Metepec'),
(1, 'Metztitlán'),
(1, 'Mineral del Chico'),
(1, 'Mineral del Monte'),
(1, 'Mineral de la Reforma'),
(1, 'Mixquiahuala de Juárez'),
(1, 'Molango de Escamilla'),
(1, 'Nicolás Flores'),
(1, 'Nopala de Villagrán'),
(1, 'Omitlán de Juárez'),
(1, 'Pacula'),
(1, 'Pachuca de Soto'),
(1, 'Pisaflores'),
(1, 'Progreso de Obregón'),
(1, 'San Agustín Metzquititlán'),
(1, 'San Agustín Tlaxiaca'),
(1, 'San Bartolo Tutotepec'),
(1, 'San Felipe Orizatlán'),
(1, 'San Salvador'),
(1, 'Santiago de Anaya'),
(1, 'Santiago Tulantepec de Lugo Guerrero'),
(1, 'Singuilucan'),
(1, 'Tasquillo'),
(1, 'Tecozautla'),
(1, 'Tenango de Doria'),
(1, 'Tepeapulco'),
(1, 'Tepehuacán de Guerrero'),
(1, 'Tepeji del Río de Ocampo'),
(1, 'Tepetitlán'),
(1, 'Tetepango'),
(1, 'Tezontepec de Aldama'),
(1, 'Tianguistengo'),
(1, 'Tizayuca'),
(1, 'Tlahuelilpan'),
(1, 'Tlahuiltepa'),
(1, 'Tlanalapa'),
(1, 'Tlanchinol'),
(1, 'Tlaxcoapan'),
(1, 'Tolcayuca'),
(1, 'Tula de Allende'),
(1, 'Tulancingo de Bravo'),
(1, 'Villa de Tezontepec'),
(1, 'Xochiatipan'),
(1, 'Xochicoatlán'),
(1, 'Yahualica'),
(1, 'Zacualtipán de Ángeles'),
(1, 'Zapotlán de Juárez'),
(1, 'Zempoala'),
(1, 'Zimapán');