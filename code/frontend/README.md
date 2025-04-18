# Finease Web Frontend Documentation

This document provides an overview of the frontend structure, functionality, and setup instructions for Team 2's DASS Spring 2025 Project.

## File Structure

```
frontend/
├── public/                 # Static files
│   ├── assets/             # Static assets
│   │   ├── logo.png        # Logo image
│   │   └── qr.png          # QR code image
│   ├── images/             # Image files
│   │   └── format1.png     # Format reference image
│   ├── favicon.ico         # Website favicon
│   ├── index.html          # Main HTML file
│   ├── logo192.png         # React logo (192px)
│   ├── logo512.png         # React logo (512px)
│   ├── manifest.json       # Web app manifest
│   └── robots.txt          # Search engine instructions
├── src/                    # Source code
│   ├── components/         # React components
│   │   ├── Auth/           # Authentication components
│   │   ├── Dashboard.js    # Dashboard component
│   │   ├── EditProfile.js  # Profile editing component
│   │   ├── Epf.js          # EPF management component
│   │   ├── EpfEcr.js       # EPF ECR component
│   │   ├── File.js         # File management component
│   │   ├── FloatingChat.js # Chat support component
│   │   ├── Gst.js          # GST management component
│   │   ├── GstFiling.js    # GST filing component
│   │   ├── Invoice.js      # Invoice component
│   │   ├── invoice/        # Invoice related components
│   │   ├── ewaybill/       # E-way bill components
│   │   ├── Itr.js          # ITR component
│   │   ├── ItrFiling.js    # ITR filing component
│   │   ├── Navbar.js       # Navigation bar component
│   │   ├── ProfilePage.js  # User profile component
│   │   ├── Scan.js         # Document scanning component
│   │   ├── ScanUpload.js   # Document upload component
│   │   └── ... other components
│   ├── context/            # React context providers
│   │   └── AuthContext.js  # Authentication context
│   ├── App.js              # Main App component
│   ├── App.test.js         # App component tests
│   ├── index.css           # Global CSS styles
│   ├── index.js            # Entry point
│   ├── output.css          # Compiled CSS
│   ├── reportWebVitals.js  # Performance measurement
│   └── setupTests.js       # Test configuration
├── .env                    # Environment variables
├── package.json            # Dependencies and scripts
├── postcss.config.js       # PostCSS configuration
├── tailwind.config.js      # Tailwind CSS configuration
└── README.md               # This file
```

## File Descriptions

### Main Files

- **src/App.js**: Main component defining routes and application structure
- **src/index.js**: Entry point for the React application
- **public/index.html**: HTML template for the React application
- **package.json**: Defines project dependencies, scripts, and metadata

### Key Directories

- **public/**: Contains static files that are served directly
- **src/components/**: Contains React components organized by feature
- **src/context/**: Contains React context providers for state management
- **public/assets/**: Contains static assets like logos and images

## Technology Stack

- **React**: UI library for building component-based interfaces
- **React Router**: For navigation and routing
- **Tailwind CSS**: Utility-first CSS framework for styling
- **Framer Motion**: For animations and transitions
- **Axios**: HTTP client for API requests
- **Chart.js**: For data visualization
- **React PDF**: For PDF generation and handling

## Setup Instructions

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- Access to backend API

### Installation

1. Clone the repository:
```bash
git clone https://github.com/your-org/dass-spring-2025-project-team-2.git
cd dass-spring-2025-project-team-2/code/frontend
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file in the root directory with the following variables:
```
REACT_APP_API_URL=http://localhost:5000/api
```
**Change this to API_URL of hosted app, If required.**


## Running the Application

### Development Mode

Start the development server:
```bash
npm start
```

This will launch the application in development mode at `http://localhost:3000`.

### Building for Production

To create a production build:
```bash
npm run build
```

The optimized build will be available in the `build/` directory.

### Running Tests

To execute the test suite:
```bash
npm test
```

## Features

The frontend provides the following key features:
- User authentication (login/registration)
- Dashboard with financial overview
- Invoice management and creation
- E-Way Bill generation and management
- GST filing and management
- ITR (Income Tax Return) filing
- EPF (Employees' Provident Fund) management
- Document scanning and upload
- Profile management
- Chat support

## Authentication

Authentication is handled through the AuthContext provider, which manages:
- User login state
- JWT token storage
- Protected route access

## API Integration

The application connects to the backend API, with the base URL configured in environment variables.
API calls are primarily made using the Axios library, with endpoints organized by feature.

## Styling

The application uses:
- Tailwind CSS for utility-based styling
- Custom CSS in `index.css` for specific components
- Responsive design for mobile and desktop views
