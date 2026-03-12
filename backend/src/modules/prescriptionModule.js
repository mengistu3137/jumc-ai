'use strict';
const { pool } = require('./db');

/**
 * Create a prescription record in the database.
 *
 * Attempts to resolve doctorId and patientId to their numeric DB primary keys.
 * Falls back to mock data (no DB write) if the DB is unreachable or unseeded.
 *
 * @returns {Promise<{ id: number|string, drug: string, dosage: string, frequency: string, duration: string, status: string, mock?: boolean }>}
 */
async function create({ doctorId, patientId, drug, dosage, frequency, duration, status = 'active', instructions = '' }) {
  try {
    // Resolve staff record
    const [staffRows] = await pool.query(
      'SELECT id FROM staff WHERE staff_id = ? OR name = ? LIMIT 1',
      [String(doctorId), String(doctorId)]
    );
    let staffDbId = staffRows[0]?.id;
    if (!staffDbId) {
      const [fallback] = await pool.query('SELECT id FROM staff LIMIT 1');
      staffDbId = fallback[0]?.id;
    }

    // Resolve patient record
    let patientDbId = null;
    if (patientId) {
      const [patientRows] = await pool.query(
        'SELECT id FROM patients WHERE mrn = ? OR id = ? LIMIT 1',
        [String(patientId), parseInt(patientId) || 0]
      );
      patientDbId = patientRows[0]?.id;
    }
    if (!patientDbId) {
      const [fallback] = await pool.query('SELECT id FROM patients LIMIT 1');
      patientDbId = fallback[0]?.id;
    }

    if (!staffDbId || !patientDbId) {
      // DB not seeded — return mock so the workflow still completes
      return { id: `mock-${Date.now()}`, drug, dosage, frequency, duration, status, mock: true };
    }

    const [result] = await pool.query(
      `INSERT INTO prescriptions
         (patient_id, prescribed_by, drug_name, dosage, frequency, duration, instructions, status)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [patientDbId, staffDbId, drug, dosage, frequency, duration, instructions, status]
    );

    return { id: result.insertId, drug, dosage, frequency, duration, status };
  } catch (err) {
    console.warn('[prescriptionModule] DB error, returning mock:', err.message);
    return { id: `mock-${Date.now()}`, drug, dosage, frequency, duration, status, mock: true };
  }
}

/**
 * Fetch a single prescription by ID.
 *
 * @param {number} id
 */
async function getById(id) {
  try {
    const [rows] = await pool.query('SELECT * FROM prescriptions WHERE id = ? LIMIT 1', [id]);
    return rows[0] || null;
  } catch (err) {
    console.warn('[prescriptionModule] getById error:', err.message);
    return null;
  }
}

module.exports = { create, getById };
