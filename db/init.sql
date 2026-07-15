-- Database voor Turkse Voetbalshop 2
CREATE DATABASE IF NOT EXISTS voetbalshop2
  CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

USE voetbalshop2;

DROP TABLE IF EXISTS order_items;
DROP TABLE IF EXISTS orders;
DROP TABLE IF EXISTS product_variants;
DROP TABLE IF EXISTS products;

CREATE TABLE products (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(120) NOT NULL,
    price DECIMAL(8, 2) NOT NULL,
    club VARCHAR(60) NOT NULL,
    color VARCHAR(60),
    image VARCHAR(255),
    description TEXT
);

CREATE TABLE product_variants (
    id INT AUTO_INCREMENT PRIMARY KEY,
    product_id INT NOT NULL,
    size ENUM('S', 'M', 'L', 'XL', 'XXL') NOT NULL,
    stock INT NOT NULL DEFAULT 0,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
    UNIQUE KEY uniq_product_size (product_id, size)
);

CREATE TABLE orders (
    id INT AUTO_INCREMENT PRIMARY KEY,
    order_number VARCHAR(40) NOT NULL UNIQUE,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    email VARCHAR(200) NOT NULL,
    address VARCHAR(200) NOT NULL,
    postal_code VARCHAR(20) NOT NULL,
    city VARCHAR(100) NOT NULL,
    country VARCHAR(100) NOT NULL,
    total DECIMAL(10, 2) NOT NULL,
    discount_code VARCHAR(40),
    discount_percent DECIMAL(4, 2) DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE order_items (
    id INT AUTO_INCREMENT PRIMARY KEY,
    order_id INT NOT NULL,
    product_id INT NOT NULL,
    size ENUM('S', 'M', 'L', 'XL', 'XXL') NOT NULL,
    custom_name VARCHAR(30),
    quantity INT NOT NULL,
    unit_price DECIMAL(8, 2) NOT NULL,
    FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
    FOREIGN KEY (product_id) REFERENCES products(id)
);

INSERT INTO products (name, price, club, color, image, description) VALUES
('Galatasaray Thuisshirt 24/25', 84.99, 'Galatasaray', 'geel-rood', 'galatasaray.png',
 'Het officiële thuisshirt van Galatasaray voor seizoen 24/25. Klassiek geel-rood design met ademende stof, perfect voor in het stadion of op straat.'),
('Fenerbahçe Thuisshirt 24/25', 84.99, 'Fenerbahçe', 'geel-blauw', 'fenerbahce.png',
 'Het officiële thuisshirt van Fenerbahçe voor seizoen 24/25. Iconische geel-blauwe strepen, gemaakt van lichtgewicht sneldrogend materiaal.'),
('Beşiktaş Thuisshirt 24/25', 84.99, 'Beşiktaş', 'zwart-wit', 'besiktas.png',
 'Het officiële thuisshirt van Beşiktaş voor seizoen 24/25. Tijdloos zwart-wit design van de Zwarte Adelaars uit Istanbul.'),
('Trabzonspor Thuisshirt 24/25', 79.99, 'Trabzonspor', 'bordeaux-blauw', 'trabzonspor.png',
 'Het officiële thuisshirt van Trabzonspor voor seizoen 24/25. De kenmerkende bordeaux-blauwe kleuren van de trots van de Zwarte Zee.'),
('Başakşehir Thuisshirt 24/25', 74.99, 'Başakşehir', 'oranje-marine', 'basaksehir.png',
 'Het officiële thuisshirt van İstanbul Başakşehir voor seizoen 24/25. Modern oranje-marineblauw design met comfortabele pasvorm.'),
('Bursaspor Thuisshirt 24/25', 69.99, 'Bursaspor', 'groen-wit', 'bursaspor.png',
 'Het officiële thuisshirt van Bursaspor voor seizoen 24/25. De groen-witte kleuren van de Groene Krokodillen uit Bursa.'),
('Konyaspor Thuisshirt 24/25', 69.99, 'Konyaspor', 'groen-wit', 'konyaspor.png',
 'Het officiële thuisshirt van Konyaspor voor seizoen 24/25. Fris groen-wit design met moderne details.'),
('Sivasspor Thuisshirt 24/25', 69.99, 'Sivasspor', 'rood-wit', 'sivasspor.png',
 'Het officiële thuisshirt van Sivasspor voor seizoen 24/25. Krachtig rood-wit design van de club uit Centraal-Anatolië.'),
('Antalyaspor Thuisshirt 24/25', 69.99, 'Antalyaspor', 'rood-wit', 'antalyaspor.png',
 'Het officiële thuisshirt van Antalyaspor voor seizoen 24/25. Rood-wit design van de club van de Turkse Rivièra.'),
('Adana Demirspor Thuisshirt 24/25', 74.99, 'Adana Demirspor', 'lichtblauw-donkerblauw', 'adanademirspor.png',
 'Het officiële thuisshirt van Adana Demirspor voor seizoen 24/25. Opvallend lichtblauw design van de Blauwe Bliksem.');

INSERT INTO product_variants (product_id, size, stock)
SELECT id, 'S', 10 FROM products;

INSERT INTO product_variants (product_id, size, stock)
SELECT id, 'M', 12 FROM products;

INSERT INTO product_variants (product_id, size, stock)
SELECT id, 'L', 12 FROM products;

INSERT INTO product_variants (product_id, size, stock)
SELECT id, 'XL', 8 FROM products;

INSERT INTO product_variants (product_id, size, stock)
SELECT id, 'XXL', 6 FROM products;
