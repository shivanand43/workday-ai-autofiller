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
## 🎥 Demo Video

Watch the project demo here:

[▶️ Click Here to Watch Demo Video](https://drive.google.com/file/d/1BLnoPIOmfGQvIFcf3bzlyrRnnROOZCSg/view?usp=sharing)