'use strict';
const router = require('express').Router();
const path   = require('path');
const multer = require('multer');

const { transcribeAudioFile, parseCommandWithAI } = require('../../modules/commandInterpreter');
const workflowEngine = require('../../modules/workflowEngine');
const commandLogger  = require('../../modules/commandLogger');

// Store uploads in /tmp – OS will clean them up
const upload = multer({
  dest: '/tmp/jumc-uploads/',
  limits: { fileSize: 10 * 1024 * 1024 }, // 10 MB cap
  fileFilter: (_req, file, cb) => {
    const ext = path.extname(file.originalname || '').toLowerCase();
    const allowed = ['.m4a', '.webm', '.mp4', '.wav', '.ogg', '.mp3', '.aac'];
    if (allowed.includes(ext) || file.mimetype.startsWith('audio/')) {
      cb(null, true);
    } else {
      cb(new Error('Only audio files are accepted'));
    }
  },
});

// ── POST /api/voice/transcribe ────────────────────────────────────────────────
// Accepts a multipart audio file, returns the transcribed text.
router.post('/transcribe', upload.single('audio'), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No audio file uploaded' });
  }
  try {
    const text = await transcribeAudioFile(req.file.path);
    res.json({ text });
  } catch (err) {
    console.error('[voice/transcribe]', err);
    res.status(500).json({ error: 'Transcription failed', details: err.message });
  }
});

// ── POST /api/voice/command ───────────────────────────────────────────────────
// Accepts a raw text command, parses it, runs the hospital workflow.
router.post('/command', async (req, res) => {
  const { rawText, doctorId, patientId, timestamp } = req.body;

  if (!rawText || typeof rawText !== 'string' || rawText.trim().length === 0) {
    return res.status(400).json({ error: 'rawText is required and must be a non-empty string' });
  }

  // Sanitise inputs to prevent injection
  const safeText     = rawText.trim().slice(0, 2000);
  const safeDoctorId = String(doctorId  || 'unknown').replace(/[^\w\s-]/g, '').slice(0, 64);
  const safePatientId = patientId
    ? String(patientId).replace(/[^\w-]/g, '').slice(0, 64)
    : null;

  try {
    const parsed = await parseCommandWithAI(safeText);

    const workflowResult = await workflowEngine.execute(parsed, {
      doctorId:  safeDoctorId,
      patientId: safePatientId,
    });

    await commandLogger.log({
      staffId:   safeDoctorId,
      patientId: safePatientId,
      rawText:   safeText,
      parsed,
      result: workflowResult.success ? 'success' : 'error',
    });

    res.json({ ...workflowResult, parsed });
  } catch (err) {
    console.error('[voice/command]', err);
    await commandLogger.log({
      staffId: String(doctorId || 'unknown').slice(0, 64),
      patientId: null,
      rawText: String(rawText || '').slice(0, 2000),
      parsed: null,
      result: 'error',
    }).catch(() => {});
    res.status(500).json({ error: 'Command processing failed', details: err.message });
  }
});

// ── GET /api/voice/history ────────────────────────────────────────────────────
router.get('/history', async (req, res) => {
  const limit = Math.min(parseInt(req.query.limit) || 50, 200);
  try {
    const history = await commandLogger.getHistory(limit);
    res.json(history);
  } catch (err) {
    console.error('[voice/history]', err);
    res.status(500).json({ error: 'Failed to fetch history' });
  }
});

module.exports = router;
