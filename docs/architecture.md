Voice-Enabled AI Hospital Assistant — Architecture (STEP 1)

Overview:
- Mobile browser app captures audio and displays conversation.
- Backend receives parsed commands and runs workflows against hospital modules.

Core components:
- Frontend: React + TailwindCSS (mobile-first)
- Backend: Node.js + Express
- Database: MySQL
- AI: Speech->Text (Whisper/browser), NLU/LLM later
- Realtime: WebSockets for notifications

This document will be expanded iteratively in later steps.