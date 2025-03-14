
# Flask Backend Setup

This project uses a Flask backend which requires Python and some Python packages to be installed.

## Prerequisites

1. Python 3.7 or higher
2. pip (Python package manager)

## Installation Steps

1. Install Flask and Flask-CORS:

```bash
pip install Flask Flask-CORS
```

or

```bash
pip3 install Flask Flask-CORS
```

2. Run the Flask backend:

```bash
python app.py
```

or

```bash
python3 app.py
```

This will start the Flask server on http://localhost:5000

3. In a separate terminal, start the frontend:

```bash
npm run dev
```

The frontend will proxy API requests to the Flask backend.
