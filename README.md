#  AI-Powered GitHub Issue Analyzer

> **Analyze GitHub repository issues using AI to generate concise summaries, identify key discussions, uncover core problems, and recommend actionable next steps.**

<p align="center">
  <img src="https://img.shields.io/badge/React-18-61DAFB?logo=react&logoColor=white" />
  <img src="https://img.shields.io/badge/FastAPI-0.115-009688?logo=fastapi&logoColor=white" />
  <img src="https://img.shields.io/badge/TypeScript-5.5-3178C6?logo=typescript&logoColor=white" />
  <img src="https://img.shields.io/badge/Python-3.12-3776AB?logo=python&logoColor=white" />
  <img src="https://img.shields.io/badge/SQLite-Database-003B57?logo=sqlite&logoColor=white" />
  <img src="https://img.shields.io/badge/Groq-Llama%203-orange" />
</p>

---

##  Live Demo

### 🔗 Frontend
**https://ai-powered-github-issue-analyzer.netlify.app/**

### ⚙️ Backend API
**https://ai-powered-github-issue-analyzer.onrender.com/docs**

---

##  Overview

GitHub repositories often contain hundreds or even thousands of issues, making it difficult for developers to quickly understand discussions and decide where to contribute.

The **AI-Powered GitHub Issue Analyzer** is a full-stack application that leverages **Artificial Intelligence** to analyze GitHub issues and transform lengthy discussions into concise, actionable insights.

Simply enter a public GitHub repository URL, browse its open issues, and generate AI-powered analyses that summarize the issue, highlight important discussions, identify key technical problems, and recommend the next steps for contributors.

Designed for **developers**, **open-source contributors**, and **project maintainers**, this tool helps reduce the time spent reading long issue threads while improving productivity and decision-making.

---

##  Features

###  Repository Analysis
- Analyze any public GitHub repository
- Fetch open issues using the GitHub REST API
- Search and sort repository issues

###  AI-Powered Insights
- Generate concise issue summaries
- Identify key technical problems
- Highlight important comments and discussions
- Suggest actionable next steps for contributors

###  Issue Management
- Browse repository issues in a clean interface
- View issue metadata including labels, author, comments, and timestamps
- Sort issues by:
  - Most Recent
  - Oldest
  - Most Commented

###  Analysis History
- Automatically save analyzed issues
- Access previous analyses through a dedicated History page
- Review AI-generated summaries anytime

###  Modern User Experience
- Responsive interface for desktop and mobile
- Fast and intuitive workflow
- Clean developer-focused UI
- Loading states and informative error handling

###  Performance
- FastAPI backend for high-performance API responses
- Axios-powered frontend communication
- Optimized React state management
- SQLite database for lightweight local storage

###  Secure Configuration
- API keys managed through environment variables
- Backend/frontend separation
- Configurable CORS support
- No hardcoded credentials
