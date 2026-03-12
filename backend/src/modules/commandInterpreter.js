'use strict';
const fs     = require('fs');
const OpenAI = require('openai').default;

// ── Rule-based patterns ───────────────────────────────────────────────────────
// Each pattern: { regex, extract(matchArray) → parsed object }

const RULES = [
  {
    // "prescribe Amoxicillin 500mg three times daily for seven days"
    // Handles both numeric ("3 times", "7 days") and word ("three times", "seven days") forms
    regex: /prescri(?:be|ption)[:\s]+(\w[\w\s-]*?)\s+(\d[\d.]*\s*(?:mg|g|ml|mcg|iu|units?))\s+(.+?)\s+(?:for|x)\s+(.+?(?:days?|weeks?|months?))\b/i,
    extract: (m) => ({
      action:    'prescribe',
      drug:      m[1].trim().toLowerCase(),
      dosage:    m[2].trim().toLowerCase(),
      frequency: m[3].trim().toLowerCase(),
      duration:  m[4].trim().toLowerCase(),
    }),
  },
  {
    // "check stock for amoxicillin" / "is paracetamol available"
    regex: /(?:(?:check|verify)\s+(?:stock|availability)\s+(?:of\s+|for\s+)?(\w[\w\s-]+)|(?:is|any)\s+(\w[\w\s-]+?)\s+(?:available|in\s+stock))/i,
    extract: (m) => ({ action: 'check_stock', drug: (m[1] || m[2]).trim().toLowerCase() }),
  },
  {
    // "order lab CBC for patient 001" / "request complete blood count"
    regex: /(?:order|request|send)\s+(?:a\s+)?lab(?:oratory)?\s+(?:test\s+)?(?:for\s+)?(\w[\w\s-]+?)(?:\s+for\s+(?:patient\s+)?(\w+))?$/i,
    extract: (m) => ({
      action:  'lab_order',
      test:    m[1].trim().toLowerCase(),
      patient: m[2]?.trim() || null,
    }),
  },
  {
    // "add doctor note: patient seems stable"
    regex: /(?:add|write|record|note|create)\s+(?:a\s+)?(?:doctor\s+|clinical\s+)?note[:\s]+(.+)/i,
    extract: (m) => ({ action: 'doctor_note', note: m[1].trim() }),
  },
  {
    // "notify pharmacy about low stock" / "alert nurse station"
    regex: /(?:notify|alert|send\s+.*?to|page)\s+(pharmacy|lab(?:oratory)?|nurse[s]?|staff)\b(.*)?/i,
    extract: (m) => ({
      action:  'notify',
      target:  m[1].trim().toLowerCase(),
      message: (m[2] || '').trim(),
    }),
  },
];

/**
 * Fast rule-based parser — no network call needed.
 * Returns null if no pattern matches.
 *
 * @param {string} text
 * @returns {object|null}
 */
function parseWithRules(text) {
  for (const rule of RULES) {
    const m = text.match(rule.regex);
    if (m) return rule.extract(m);
  }
  return null;
}

/**
 * Parse a voice command using:
 *   1. Rule-based patterns (fast, no API cost)
 *   2. OpenAI GPT-4o-mini (if OPENAI_API_KEY is set and rules don't match)
 *   3. Fallback { action: 'unknown' } so the system always returns something
 *
 * @param {string} text
 * @returns {Promise<object>}
 */
async function parseCommandWithAI(text) {
  // 1. Rules first
  const ruleResult = parseWithRules(text);
  if (ruleResult) return ruleResult;

  // 2. AI fallback
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return { action: 'unknown', rawText: text };
  }

  try {
    const openai = new OpenAI({ apiKey });
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: `You are a hospital voice-command parser.
Parse the doctor's speech into a JSON object.
Valid actions and required fields:
  prescribe   → { action, drug, dosage, frequency, duration }
  check_stock → { action, drug }
  lab_order   → { action, test, patient? }
  doctor_note → { action, note }
  notify      → { action, target, message? }
  unknown     → { action, rawText }
Return ONLY valid JSON, no markdown fences.`,
        },
        { role: 'user', content: text },
      ],
      max_tokens: 256,
      temperature: 0,
    });

    const raw = completion.choices[0]?.message?.content?.trim();
    return JSON.parse(raw);
  } catch (err) {
    console.warn('[commandInterpreter] AI parse failed:', err.message);
    return { action: 'unknown', rawText: text };
  }
}

/**
 * Transcribe an audio file.
 *
 * If OPENAI_API_KEY is set → uses Whisper API.
 * Otherwise              → returns a mock transcript for development.
 *
 * @param {string} filePath  Absolute path to the uploaded audio file
 * @returns {Promise<string>}
 */
async function transcribeAudioFile(filePath) {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    console.warn('[commandInterpreter] No OPENAI_API_KEY – returning mock transcript');
    return 'Prescribe Amoxicillin 500mg three times daily for seven days';
  }

  const openai      = new OpenAI({ apiKey });
  const audioStream = fs.createReadStream(filePath);

  const transcription = await openai.audio.transcriptions.create({
    file:            audioStream,
    model:           'whisper-1',
    language:        'en',
    response_format: 'text',
  });

  return typeof transcription === 'string' ? transcription : transcription.text;
}

module.exports = { parseCommandWithAI, transcribeAudioFile, parseWithRules };
