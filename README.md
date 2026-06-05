# 🚀 Workday AI Autofiller

## 📌 Project Overview

Workday AI Autofiller is an AI-powered Chrome Extension designed to simplify and automate the job application process on Workday career portals.

The extension allows users to upload a resume in PDF format, automatically extracts important information using Artificial Intelligence, stores the structured data locally, scans Workday application forms, intelligently matches resume data with form fields, and auto-fills the application.

This project was built as part of a technical assessment focused on Chrome Extension Development, AI Integration, Dynamic Form Automation, and Resume Parsing.

---

# 🎯 Problem Statement

Many job seekers spend significant time manually filling the same information repeatedly across multiple Workday job applications.

Challenges include:

* Re-entering personal information
* Filling education details repeatedly
* Adding work experience manually
* Matching resume information to different field names
* Navigating long multi-step forms

This project solves these problems using AI-powered automation.

---

# ✨ Key Features

## 1. PDF Resume Upload

Users can upload a resume directly inside the Chrome Extension.

Supported Format:

* PDF (.pdf)

---

## 2. AI Resume Parsing

The extension extracts information from resumes and converts unstructured text into structured JSON.

Example:

```json
{
  "name": "John Doe",
  "email": "john@gmail.com",
  "phone": "9876543210",
  "skills": [
    "React",
    "JavaScript",
    "Node.js"
  ]
}
```

---

## 3. Local Resume Storage

Parsed resume data is saved using Chrome Storage API.

Benefits:

* No need to upload resume repeatedly
* Faster user experience
* Data persistence across browser sessions

---

## 4. Workday Form Detection

The extension scans the currently opened Workday page and detects:

* Input Fields
* Dropdowns
* Radio Buttons
* Checkboxes
* Text Areas

---

## 5. AI Field Mapping

One of the most important features.

Different companies use different field names.

Examples:

| Resume Data | Form Label             |
| ----------- | ---------------------- |
| phone       | Mobile Number          |
| email       | Email Address          |
| location    | Current City           |
| skills      | Technical Competencies |

Instead of hardcoding rules, AI understands field meaning and maps values intelligently.

---

## 6. Smart Autofill

After mapping:

* Text fields are filled
* Dropdowns are selected
* Radio buttons are clicked
* Checkboxes are handled automatically

The extension also dispatches:

* input event
* change event
* blur event

This ensures compatibility with React-based Workday forms.

---

# 🧠 AI Workflow

## Step 1

User uploads resume.

↓

## Step 2

PDF text extraction begins.

↓

## Step 3

Resume text is sent to Gemini AI.

↓

## Step 4

Gemini converts resume into structured JSON.

↓

## Step 5

JSON data is stored in Chrome Storage.

↓

## Step 6

User opens Workday application.

↓

## Step 7

Extension scans form fields.

↓

## Step 8

AI matches form labels with resume data.

↓

## Step 9

Extension fills the application automatically.

---

# 🛠️ Tech Stack

## Frontend

* React 19
* Vite

---

## Chrome Extension

* Manifest V3
* Content Scripts
* Background Service Worker
* Chrome Runtime Messaging
* Chrome Storage API

---

## Artificial Intelligence

* Google Gemini API
* Gemini 2.5 Flash Model

---

## PDF Processing

* pdfjs-dist

---

## Styling

* CSS Modules

---

# 📂 Project Structure
```
📂 workday-ai-autofiller/
 ┣ 📂 public/
 ┃ ┗ 📜 manifest.json       --> The "ID Card" that tells Chrome this is an extension.
 ┣ 📂 src/
 ┃ ┣ 📜 App.jsx             --> The Popup Window UI (Buttons & Text you see).
 ┃ ┣ 📜 App.module.css      --> The Paintbrush (Makes the popup look pretty).
 ┃ ┣ 📜 background.js       --> The Brain (Talks to the Gemini AI invisibly).
 ┃ ┣ 📜 content.js          --> The Spy (Goes into the Workday website to type things).
 ┃ ┗ 📜 pdfParser.js        --> The Reader (Extracts words from your PDF).
 ┣ 📜 package.json          --> The grocery list of all our libraries.
 ┣ 📜 vite.config.js        --> The builder settings.
 ┗ 📜 .env                  --> The secret safe (Holds your AI Password).
```
---

# 📚 Libraries Used

## React

Used for creating popup interface.

---

## pdfjs-dist

Used for reading PDF files directly in browser.

---

## @crxjs/vite-plugin

Allows building Chrome Extensions using Vite.

---

## Chrome Storage API

Stores parsed resume data locally.

---

## Chrome Runtime Messaging

Communication between:

* Popup
* Background Script
* Content Script

---

# 🔑 Gemini AI Integration

## Purpose

Gemini AI is used for:

* Resume Parsing
* Information Extraction
* Field Mapping
* Semantic Matching

Model Used:

```plaintext
gemini-2.5-flash
```

Reason:

* Fast
* Cost Effective
* High Accuracy
* JSON Friendly

---

# ⚙️ Installation Guide

## Step 1

Clone the project.

```bash
git clone <repository-url>
```

---

## Step 2

Install dependencies.

```bash
npm install
```

---

## Step 3

Create environment file.

```env
VITE_GEMINI_API_KEY=YOUR_API_KEY
```

---

## Step 4

Run development server.

```bash
npm run dev
```

---

## Step 5

Build extension.

```bash
npm run build
```

---

## Step 6

Open Chrome Extensions.

```plaintext
chrome://extensions
```

Enable:

```plaintext
Developer Mode
```

---

## Step 7

Click:

```plaintext
Load Unpacked
```

Select:

```plaintext
dist/
```

folder.

---

# 🧪 Testing Procedure

## Resume Parsing Test

1. Open Extension
2. Upload Resume
3. Wait for AI Analysis
4. Verify JSON Output

Expected Result:

Structured resume data should appear.

---

## Workday Autofill Test

1. Open Workday Application
2. Open Extension
3. Upload Resume
4. Click Scan & Autofill

Expected Result:

Fields automatically populate.

---

1. The "Popup Amnesia" Problem (State Management)
The Problem: Chrome aggressively saves memory by destroying extension popups the second a user clicks away. When navigating from Step 1 to Step 2 of the Workday form, the extension would "forget" the uploaded resume, forcing the user to upload it repeatedly.

The Solution: Implemented browser-level state management using chrome.storage.local. The App.jsx component was updated to immediately save the parsed JSON data to local storage and retrieve it on subsequent opens, allowing seamless multi-step navigation with a single upload.

2. Complex Field Automation (Dropdowns & Radio Buttons)
The Problem: The initial content script relied on static keyword matching (e.g., matching "First Name" to the name field). This failed on Step 3 of Workday applications, which features dynamic, company-specific custom questions via dropdowns and radio buttons (e.g., "Do you require visa sponsorship?").

The Solution: Upgraded the architecture to a Dynamic AI Mapping Loop. The content.js script was rewritten to scrape all unknown questions and their dropdown options from the page. This array of fields is sent to the background worker, where the Gemini AI compares the questions against the resume data and mathematically determines the correct option to select.

3. AI Hallucinations & JSON Syntax Errors
The Problem: Even with strict prompting, the AI model occasionally returned invalid JSON formatting. It would wrap the data in Markdown backticks (```json) or include conversational text/comments, causing JSON.parse() to throw fatal syntax errors and crash the autofill process.

The Solution: Built an aggressive fallback parser (extractValidJSON) inside background.js. Instead of trusting the raw string, the code programmatically calculates the indexOf('{') and lastIndexOf('}') to forcefully extract only the pure JSON payload, ignoring any extra characters the AI injected.

4. React Framework vs. DOM Manipulation Events
The Problem: The extension successfully injected text into the Workday input fields visually, but when the user clicked "Next", Workday threw an error claiming the fields were empty. Workday uses React, which does not register standard JavaScript input.value = "text" injections.

The Solution: Simulated human keystrokes by programmatically dispatching synthetic React DOM events. After injecting a value, the script fires new Event('input'), new Event('change'), and new Event('blur') with { bubbles: true } so the underlying framework registers the data change.

5. Vite CORS & Manifest V3 Security Blocks
The Problem: During local development, the Chrome Extension service worker was blocked from communicating with the Vite local development server (localhost:5173) due to strict Cross-Origin Resource Sharing (CORS) security policies.

The Solution: Created a custom vite.config.js file overriding the default server configuration, explicitly enabling cors: true and mapping a strictPort to allow the HMR (Hot Module Replacement) websocket to connect cleanly to Manifest V3.

6. API Rate Limiting (Error 429)
The Problem: The application suddenly halted with a RESOURCE_EXHAUSTED (429) error. The project was utilizing the gemini-2.5-flash model, which hit a strict free-tier quota limit of 20 requests per day during heavy testing.

The Solution: Implemented graceful error handling in the UI to alert the user of quota limits. To continue development, the API endpoint was successfully hot-swapped to the gemini-1.5-flash model, which provides a significantly higher free limit of 1,500 requests per day while maintaining sufficient intelligence for the data extraction tasks.


---

# 🚀 Future Improvements

* Multiple Resume Profiles
* LinkedIn Import
* Cover Letter Generation
* Job Matching Suggestions
* Multi-Language Resume Support
* Form Validation Engine
* ATS Resume Optimization

---
This project focuses on reducing candidate effort and improving job application efficiency through AI-powered automation.

---
##                          RESULT

## Resume Upload & Autofill Process
![Resume Upload](./public/Chrome%20Extension1.png)
---