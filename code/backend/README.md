# Backend Documentation

This document provides an overview of the backend structure, functionality, and setup instructions for Team 2's DASS Spring 2025 Project.

## File Structure

```
backend/
├── config/              # Configuration files
├── controllers/         # Request handlers
├── middleware/          # Express middleware
├── models/              # Database models
├── routes/              # API routes
├── utils/               # Utility functions
├── documents/           # Documentation files
├── scripts/             # Helper scripts
├── uploads/             # File upload directory
├── temp/                # Temporary files
├── .env                 # Environment variables
├── package.json         # Dependencies and scripts
├── requirements.txt     # Python dependencies
├── epf.py               # Python script for EPF processing
├── index.js             # Main entry point
└── README.md            # This file
```

## File Descriptions

### Main Files

- **index.js**: Entry point for the application, sets up the Express server and connects to the database
- **package.json**: Defines project dependencies, scripts, and metadata
- **.env**: Contains environment variables needed by the application
- **epf.py**: Python script handling EPF-related processing
- **requirements.txt**: Lists Python dependencies required for the project

### Directories

- **config/**: Contains configuration files like database.js for database connections
- **controllers/**: Handles requests and returns responses, implements API logic for authentication, document processing, etc.
- **middleware/**: Contains Express middleware for authentication, logging, error handling, etc.
- **models/**: Defines database schemas and models for EPF, Eway, invoices, and other document types
- **routes/**: Defines API endpoints and connects them to controllers
- **utils/**: Helper functions and utilities used throughout the application
- **documents/**: Contains documentation files like website_doc.txt
- **scripts/**: Contains utility scripts for various operations
- **uploads/**: Directory for storing uploaded files
- **temp/**: Directory for temporary file storage during processing

## Setup Instructions

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- MongoDB (or your database of choice)
- Python (for EPF processing scripts)

### Installation

1. Clone the repository:
```bash
git clone https://github.com/your-org/dass-spring-2025-project-team-2.git
cd dass-spring-2025-project-team-2/code/backend
```

2. Install Node.js dependencies:
```bash
npm install
```

3. Install Python dependencies (if needed for EPF processing):
```bash
pip install -r requirements.txt
```

4. Ensure the `.env` file is configured with your settings.

## Running the Backend

### Development Mode

To run the server in development mode with hot reloading:
```bash
npm run dev
```

The server will start on `http://localhost:5000` (or the port specified in your `.env` file).

### Production Mode

To start the server in production mode:
```bash
npm start
```

### Testing

To run tests:
```bash
npm test
```

## API Documentation

The API endpoints can be accessed at the base URL of your server.

## Environment Variables

The following environment variables are likely required:
- `PORT`: Server port
- `MONGODB_URI`: MongoDB connection string
- `JWT_SECRET`: Secret for JWT token generation
- `EMAIL_USER`:Email
- `EMAIL_PASSWORD`:Password
- `GEMINI_API_KEY`:API_KEY
