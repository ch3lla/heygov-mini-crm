
# HeyGov Mini CRM + AI Assistant

A modern, intelligent CRM built with Node.js, TypeScript, and Drizzle ORM. This project features a robust REST API for contact management and a powerful AI Agent (powered by Claude) that can perform complex CRM tasks, log interactions, and prepare meeting briefings via natural language.

## 🚀 Tech Stack
  * **Runtime:** Node.js (v20+)
  * **Framework:** Express.js
  * **Language:** TypeScript
  * **Database:** MySQL
  * **ORM:** Drizzle ORM
  * **AI:** Anthropic SDK (Claude 4.5 Haiku)
  * **Testing:** Vitest + Supertest
  * **Tools:** Nodemailer, Node-Cron, Zod

-----

## 🛠️ Setup & Installation

### 1. Prerequisites

Ensure you have **Node.js** and **MySQL** running locally or via Docker.

### 2. Clone and Install

```bash
git clone https://github.com/ch3lla/heygov-mini-crm
cd heygov-mini-crm
npm install
```

### 3. Environment Variables

Create a `.env` file in the root directory.

```env
# Server
PORT=4000
NODE_ENV=development

# Database (MySQL)
DATABASE_URL=mysql://user:password@localhost:3306/db_name
DATABASE_HOST=localhost
DATABASE_USER=root
DATABASE_PASSWORD=password
DATABASE_NAME=db_name

# Authentication
JWT_SECRET=your_super_secret_jwt_key
JWT_EXPIRY=24 # in hours
BCRYPT_SALT_ROUNDS=10

# AI Agent (Anthropic)
CLAUDE_API_KEY=sk-ant-api03-...

# Email Service (Nodemailer)
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_app_specific_password
```

### 4. Database Migration

Push the Drizzle schema to your MySQL database:

```bash
npm run migrate
```

### 5\. Run the Project

  * **Development (Watch Mode):**
    ```bash
    npm run dev
    ```
  * **Production:**
    ```bash
    npm run build
    npm run start
    ```

-----

## Running Tests

This project uses **Vitest** for unit and integration testing.

```bash
# Run all tests
npm test

# Run specific test file
npx vitest src/tests/agent.test.ts
```

Tests cover:
  * **Authentication:** Register/Login flows.
  * **Contacts:** CRUD operations and validation.
  * **Reminders:** Scheduler logic.
  * **AI Agent:** Intent recognition, Smart Tagging, and Interaction flows.

-----

## Project Structure

Key logic is separated into Controllers (HTTP handling), Services (Business Logic), and the Agent (AI Logic).

```text
src/
├── agent/              # AI Agent Logic (Claude)
│   ├── executor/       # Maps AI tools to Service functions
│   ├── prompts/        # System Prompts & Intent Definitions
│   ├── tools/          # Tool Definitions (JSON Schema)
│   └── index.ts        # Main Agent Loop
├── controllers/        # Request Handlers
├── db/                 # Database Schema & Drizzle Config
├── services/           # Business Logic
│   ├── contacts/       # CRUD for Contacts, Search & Analytics logic
│   ├── email/          # Nodemailer logic
│   └── reminders/      # Reminder logic
├── routes/             # API Route Definitions
└── jobs/               # Cron jobs (e.g., Reminder checks)
```

-----

## AI Assistant Features

The AI Agent is accessible via `POST /api/v1/assistant/query`. It goes beyond simple chatbots by executing real database actions.

### 1. Smart Contact Management (With Tagging)

The agent automatically infers context to tag contacts.

  * **User:** "Add Alex, a React Developer from Google."
  * **AI Action:** Creates contact Alex. **Tags:** `['developer', 'react', 'tech']`. **Company:** Google.
  * **User:** "Update Alex, he's now a VIP client."
  * **AI Action:** Adds `vip` to Alex's tags.

### 2. Interaction Logging

Keep a history of your relationships.

  * **User:** "I had a call with Sarah yesterday about the Q4 roadmap."
  * **AI Action:** Logs a `call` interaction dated yesterday with the summary "Discussed Q4 roadmap".

### 3. Meeting Briefings (Synthesizer)

Prepares you for meetings by aggregating data.

  * **User:** "Prep me for my meeting with Alex."
  * **AI Action:** Generates a report containing:
      * Alex's Profile & Role.
      * Summary of last 5 interactions (Calls, Emails).
      * Any pending/overdue reminders for him.

### 4. Proactive Communications

  * **Email:** "Send an email to Alex saying we are ready to sign." (Drafts and sends via Nodemailer).
  * **Reminders:** "Remind me to call Sarah next Tuesday at 10am." (Parses natural language dates to ISO format).

### 5. Intelligent Search

  * **User:** "Who did I meet at the conference last week?"
  * **AI Action:** Filters contacts by date range AND keyword "conference" or tags.
  * **User:** "How is my network growing?"
  * **AI Action:** Returns CRM Analytics (New contacts count, interaction volume).

-----

## API Routes Overview

All routes are prefixed with `/api/v1`.

### Authentication

  * `POST /auth/register` - Create a new account.
  * `POST /auth/login` - Get JWT access token.

### Assistant

  * `POST /assistant/query` - Send natural language commands to the AI.
      * Body: `{ "query": "Add Alex from MegaCorp..." }`

### Contacts

  * `GET /contacts/all` - Retrieve all active contacts.
  * `GET /contacts/:contactId` - Get details for one contact.
  * `POST /contacts/add` - Create a contact (requires Name OR Email).
  * `PATCH /contacts/update/:contactId` - Update details.
  * `PATCH /contacts/remove/:contactId` - Soft delete (Move to Trash).
  * `PATCH /contacts/delete/:contactId` - Permanent delete.
  * `PATCH /contacts/restore/:contactId` - Restore from Trash.
  * `GET /contacts/trash` - View deleted contacts.

### Reminders

  * `GET /reminder/all` - Get user reminders.
  * `POST /reminder/add` - Create a manual reminder.
  * `PATCH /reminder/:reminderId` - Update reminder.
  * `DELETE /reminder/:reminderId` - Delete reminder.

### User

  * `GET /user/profile` - Get profile info.
  * `PATCH /user/profile` - Update password/details.