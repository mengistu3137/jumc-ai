-- Hospital AI initial schema (high-level)

-- Patients
CREATE TABLE IF NOT EXISTS patients (
  id INT AUTO_INCREMENT PRIMARY KEY,
  mrn VARCHAR(64) UNIQUE NOT NULL,
  first_name VARCHAR(128) NOT NULL,
  last_name VARCHAR(128) NOT NULL,
  dob DATE,
  gender VARCHAR(16),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Staff (doctors, nurses)
CREATE TABLE IF NOT EXISTS staff (
  id INT AUTO_INCREMENT PRIMARY KEY,
  staff_id VARCHAR(64) UNIQUE,
  name VARCHAR(256),
  role VARCHAR(64),
  department VARCHAR(128),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Prescriptions
CREATE TABLE IF NOT EXISTS prescriptions (
  id INT AUTO_INCREMENT PRIMARY KEY,
  patient_id INT NOT NULL,
  prescribed_by INT NOT NULL,
  drug_name VARCHAR(256) NOT NULL,
  dosage VARCHAR(128),
  frequency VARCHAR(128),
  duration VARCHAR(128),
  instructions TEXT,
  status VARCHAR(64) DEFAULT 'pending',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (patient_id) REFERENCES patients(id),
  FOREIGN KEY (prescribed_by) REFERENCES staff(id)
);

-- Pharmacy stock
CREATE TABLE IF NOT EXISTS pharmacy_stock (
  id INT AUTO_INCREMENT PRIMARY KEY,
  drug_name VARCHAR(256) NOT NULL,
  strength VARCHAR(64),
  form VARCHAR(64),
  quantity INT DEFAULT 0,
  last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Notifications
CREATE TABLE IF NOT EXISTS notifications (
  id INT AUTO_INCREMENT PRIMARY KEY,
  type VARCHAR(64),
  payload JSON,
  read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Simple audit table for voice commands
CREATE TABLE IF NOT EXISTS voice_commands (
  id INT AUTO_INCREMENT PRIMARY KEY,
  staff_id INT,
  patient_id INT,
  raw_text TEXT,
  parsed JSON,
  result VARCHAR(128),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
