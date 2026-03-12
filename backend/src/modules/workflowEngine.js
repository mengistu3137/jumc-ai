'use strict';
const pharmacyModule    = require('./pharmacyModule');
const prescriptionModule = require('./prescriptionModule');
const { broadcast }     = require('./websockets');

/**
 * Routes a parsed voice command to the correct hospital module
 * and returns a result with a human-readable `response` string.
 *
 * @param {object} parsed   Output from commandInterpreter
 * @param {{ doctorId: string, patientId: string|null }} context
 * @returns {Promise<object>}
 */
async function execute(parsed, context) {
  const { action }              = parsed;
  const { doctorId, patientId } = context;

  switch (action) {
    case 'prescribe':   return handlePrescribe(parsed, doctorId, patientId);
    case 'check_stock': return handleCheckStock(parsed);
    case 'lab_order':   return handleLabOrder(parsed, doctorId, patientId);
    case 'doctor_note': return handleDoctorNote(parsed, doctorId, patientId);
    case 'notify':      return handleNotify(parsed, doctorId);
    default:
      return {
        success:  false,
        response: "I'm sorry, I didn't understand that command. Please speak clearly and try again.",
        action:   'unknown',
      };
  }
}

// ── Handlers ──────────────────────────────────────────────────────────────────

async function handlePrescribe(parsed, doctorId, patientId) {
  const { drug, dosage, frequency, duration } = parsed;

  // 1. Check pharmacy stock
  const stockInfo = await pharmacyModule.checkStock(drug);

  // 2. Create the prescription record in the DB
  const prescription = await prescriptionModule.create({
    doctorId,
    patientId,
    drug,
    dosage,
    frequency,
    duration,
    status: stockInfo.inStock ? 'active' : 'pending_stock',
  });

  // 3. Push real-time notification to pharmacy via WebSocket
  broadcast('pharmacy_notification', {
    type:           'new_prescription',
    prescriptionId: prescription.id,
    drug,
    dosage,
    frequency,
    duration,
    inStock:        stockInfo.inStock,
    quantity:       stockInfo.quantity,
    doctorId,
    patientId,
  });

  // 4. Build human-readable response
  const response = stockInfo.inStock
    ? `Prescription created: ${drug} ${dosage}, ${frequency} for ${duration}. ` +
      `Pharmacy has ${stockInfo.quantity} units in stock. Pharmacy notified.`
    : `Prescription recorded: ${drug} ${dosage}, ${frequency} for ${duration}. ` +
      `WARNING: ${drug} is currently out of stock. Pharmacy has been alerted to restock.`;

  return {
    success: true,
    response,
    action:  'prescribe',
    prescriptionId: prescription.id,
    stockInfo,
    ...parsed,
  };
}

async function handleCheckStock(parsed) {
  const { drug } = parsed;
  const stockInfo = await pharmacyModule.checkStock(drug);

  if (!stockInfo.inStock) {
    broadcast('stock_alert', { drug, status: 'out_of_stock' });
  }

  const response = stockInfo.inStock
    ? `${drug} is available. Stock: ${stockInfo.quantity} units` +
      (stockInfo.strength ? ` (${stockInfo.strength})` : '') + '.'
    : `${drug} is currently out of stock. The pharmacy team has been notified.`;

  return { success: true, response, action: 'check_stock', stockInfo, ...parsed };
}

async function handleLabOrder(parsed, doctorId, patientId) {
  const { test } = parsed;

  broadcast('lab_order', {
    test,
    doctorId,
    patientId,
    timestamp: new Date().toISOString(),
  });

  return {
    success:  true,
    response: `Lab order for "${test}" has been sent to the laboratory. Results will be reported to you.`,
    action:   'lab_order',
    ...parsed,
  };
}

async function handleDoctorNote(parsed, doctorId, patientId) {
  const { note } = parsed;

  broadcast('doctor_note', {
    note,
    doctorId,
    patientId,
    timestamp: new Date().toISOString(),
  });

  return {
    success:  true,
    response: `Doctor note recorded: "${note}"`,
    action:   'doctor_note',
    ...parsed,
  };
}

async function handleNotify(parsed, doctorId) {
  const { target, message } = parsed;

  broadcast('staff_notification', {
    target,
    message: message || `Doctor ${doctorId} requires your attention.`,
    doctorId,
    timestamp: new Date().toISOString(),
  });

  return {
    success:  true,
    response: `Notification sent to ${target}.`,
    action:   'notify',
    ...parsed,
  };
}

module.exports = { execute };
