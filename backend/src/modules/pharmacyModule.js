'use strict';
const { pool } = require('./db');

/**
 * Check pharmacy stock for a drug using a case-insensitive partial match.
 *
 * @param {string} drugName
 * @returns {Promise<{ inStock: boolean, quantity: number, drug: string, strength: string|null, form: string|null }>}
 */
async function checkStock(drugName) {
  try {
    const [rows] = await pool.query(
      `SELECT drug_name, strength, form, quantity
       FROM pharmacy_stock
       WHERE LOWER(drug_name) LIKE ?
       ORDER BY quantity DESC
       LIMIT 1`,
      [`%${drugName.toLowerCase()}%`]
    );

    if (rows.length === 0) {
      return { inStock: false, quantity: 0, drug: drugName, strength: null, form: null };
    }

    const row = rows[0];
    return {
      inStock:  row.quantity > 0,
      quantity: row.quantity,
      drug:     row.drug_name,
      strength: row.strength,
      form:     row.form,
    };
  } catch (err) {
    // Graceful degradation when DB is unavailable (e.g. development)
    console.warn('[pharmacyModule] DB unavailable, using fallback stock:', err.message);
    return { inStock: true, quantity: 999, drug: drugName, strength: null, form: null, fallback: true };
  }
}

/**
 * Decrement stock quantity after dispensing.
 *
 * @param {string} drugName
 * @param {number} [qty=1]
 */
async function decrementStock(drugName, qty = 1) {
  try {
    await pool.query(
      `UPDATE pharmacy_stock
       SET quantity = GREATEST(0, quantity - ?), last_updated = NOW()
       WHERE LOWER(drug_name) LIKE ?`,
      [qty, `%${drugName.toLowerCase()}%`]
    );
  } catch (err) {
    console.warn('[pharmacyModule] decrementStock error:', err.message);
  }
}

module.exports = { checkStock, decrementStock };
