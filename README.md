
# SenterosAI Chat Application

This project is a full-stack chat application with a React frontend and Flask backend.

## Project info

**URL**: https://lovable.dev/projects/d193c57e-e5bf-4638-a18a-a84865446015

## Setup Instructions

### Backend Setup (Python Flask)

1. Make sure you have Python 3.7+ installed
2. Install Flask and Flask-CORS:
   ```bash
   pip install Flask Flask-CORS
   ```
3. Run the Flask backend:
   ```bash
   python app.py
   ```
   This will start the backend server on http://localhost:5000

### Frontend Setup (React)

1. Make sure you have Node.js & npm installed - [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating)
2. Install dependencies:
   ```sh
   npm i
   ```
3. Start the development server:
   ```sh
   npm run dev
   ```
4. The frontend will be available at http://localhost:5173 and automatically proxy API requests to the Flask backend

## Features

- Chat with SenterosAI assistant
- Image uploads
- Chat history
- Multiple language support
- Dark/light theme options

## How can I edit this code?

There are several ways of editing your application.

**Use Lovable**

Simply visit the [Lovable Project](https://lovable.dev/projects/d193c57e-e5bf-4638-a18a-a84865446015) and start prompting.

Changes made via Lovable will be committed automatically to this repo.

**Use your preferred IDE**

If you want to work locally using your own IDE, you can clone this repo and push changes. Pushed changes will also be reflected in Lovable.

**Edit a file directly in GitHub**

- Navigate to the desired file(s).
- Click the "Edit" button (pencil icon) at the top right of the file view.
- Make your changes and commit the changes.

**Use GitHub Codespaces**

- Navigate to the main page of your repository.
- Click on the "Code" button (green button) near the top right.
- Select the "Codespaces" tab.
- Click on "New codespace" to launch a new Codespace environment.
- Edit files directly within the Codespace and commit and push your changes once you're done.
