# JUMC AI - Voice-Enabled Hospital Assistant

This repository contains a mobile-first hospital voice assistant architecture.

Current implementation status:
- STEP 1 complete: professional project scaffold
- Later roadmap steps are not implemented yet

## Architecture Pipeline

Voice Input  
-> Voice Capture Layer  
-> Speech Recognition  
-> AI Command Understanding  
-> Hospital Workflow Engine  
-> Hospital Management System (MySQL + Modules)

## Technology Targets

- Mobile: React Native + Expo + NativeWind (to be added in STEP 2)
- Backend: Node.js + Express REST API
- Database: MySQL
- AI: Speech recognition + command parser + workflow engine
- Real-time: WebSockets

## STEP 1 Folder Structure

```text
jumc-ai/
     backend/
          .env.example
          src/
               api/
                    controllers/
                    middlewares/
                    routes/
               app/
               config/
               database/
                    migrations/
                    repositories/
               integrations/
                    llm/
                    speech/
               modules/
                    billing/
                    doctorNotes/
                    laboratory/
                    nlp/
                    notifications/
                    patients/
                    pharmacy/
                    voice/
                    workflows/
               realtime/
               utils/
               index.js
     database/
          schema.sql
     docs/
          architecture.md
          development-roadmap.md
     frontend/
          ...existing web starter (kept unchanged)
     infrastructure/
          docker/
          scripts/
     mobile/
          App.js
          app.json
          babel.config.js
          package.json
          assets/
               icons/
               images/
          src/
               components/
               hooks/
               navigation/
               screens/
               services/
               store/
               theme/
               utils/
     shared/
          constants/
          contracts/
```

## Step Boundaries

- Implemented in STEP 1:
     - Professional mono-repo style folder organization
     - Initial Expo-compatible mobile scaffold
     - Backend domain/module scaffolding for hospital workflows
     - Shared contracts/constants folders

- Not implemented yet:
     - Conversation UI
     - Microphone recording
     - Speech-to-text
     - Backend command API
     - Rule-based or LLM parsing
     - MySQL integration and workflows

Proceed with STEP 2 next.

Add system automation:

* pharmacy integration
* lab order automation
* patient record automation

---

## step 4

Real-time communication

* doctor → pharmacy
* doctor → lab
* notifications

---

## step 5

Medical safety layer

Check:

* allergies
* drug interactions
* dosage limits

---

## step 6

Pilot testing in real hospital.

Fix errors.

Improve accuracy.

---

# 🚨 attention



### 1️⃣ Medical vocabulary recognition

Doctors speak fast and use abbreviations.

Example:

“Amox 500 TDS for 7 days.”

---

### 2️⃣ Speech accuracy in noisy hospitals

Emergency rooms are loud.

---

### 3️⃣ Command interpretation

Doctors speak informally.

Example:

> “Start him on ceftriaxone.”

AI must understand **context**.

