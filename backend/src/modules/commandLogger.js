'use strict';
const { pool } = require('./db');

/**
 * Persist a voice command audit record.
 * Non-fatal: logs to console if the DB is unavailable.
 */
async function log({ staffId, patientId, rawText, parsed, result }) {
  try {
    // Only store a numeric staff/patient id if we have one
    const numericStaff   = parseInt(staffId)   || null;
    const numericPatient = parseInt(patientId) || null;

    await pool.query(
      `INSERT INTO voice_commands (staff_id, patient_id, raw_text, parsed, result)
       VALUES (?, ?, ?, ?, ?)`,
      [
        numericStaff,
        numericPatient,
        rawText,
        parsed ? JSON.stringify(parsed) : null,
        result,
      ]
    );
  } catch (err) {
    // Store in memory as a last resort so logs aren't silently discarded
    console.warn('[commandLogger] Could not persist to DB — command logged to console:', {
      staffId, patientId, rawText, result,
    });
  }
}

/**
 * Retrieve recent voice command history.
 *
 * @param {number} limit  Maximum rows to return (capped at 200)
 * @returns {Promise<Array>}
 */
async function getHistory(limit = 50) {
  try {
    const [rows] = await pool.query(
      `SELECT id, staff_id, patient_id, raw_text, parsed, result, created_at
       FROM voice_commands
       ORDER BY created_at DESC
       LIMIT ?`,
      [Math.min(limit, 200)]
    );

    return rows.map((r) => ({
      ...r,
      // Normalise: mysql2 may return parsed as a string or as a JSON object
      parsed: r.parsed
        ? typeof r.parsed === 'string'
          ? JSON.parse(r.parsed)
          : r.parsed
        : null,
    }));
  } catch (err) {
    console.warn('[commandLogger] getHistory error:', err.message);
    return [];
  }
}

module.exports = { log, getHistory };
