# Finease Mobile App Documentation

This document provides an overview of the mobile application structure, functionality, and setup instructions for Team 2's DASS Spring 2025 Project.

## File Structure

```
MyApp/
├── .expo/              # Expo configuration files
├── assets/             # Static assets like images
├── src/                # Source code
│   ├── assets/         # Application assets (icons, images)
│   ├── components/     # UI components
│   │   ├── Auth/       # Authentication components
│   │   ├── common/     # Reusable UI components
│   │   ├── Dashboard/  # Dashboard screen components
│   │   ├── ECR/        # ECR related components
│   │   ├── EWayBill/   # E-Way Bill components
│   │   ├── FileManagement/ # File management components
│   │   ├── Filings/    # Tax filing components
│   │   ├── Invoice/    # Invoice related components
│   │   ├── Profile/    # User profile components
│   │   ├── ScanUpload/ # Document scanning components
│   │   └── Support/    # Support screen components
│   ├── context/        # React context providers
│   ├── navigation/     # Navigation configuration
│   ├── services/       # API and storage services
│   └── utils/          # Utility functions
├── App.js              # Main App component
├── app.json            # Expo configuration
├── index.js            # Entry point
├── package.json        # Dependencies and scripts
└── README.md           # This file
```

## File Descriptions

### Main Files

- **App.js**: Root component that initializes the app
- **app.json**: Expo configuration file for the app
- **index.js**: Entry point for the application
- **package.json**: Defines project dependencies, scripts, and metadata

### Directories

- **.expo/**: Contains Expo configuration files and caches
- **assets/**: Root-level assets accessible to Expo
- **src/assets/**: Application-specific assets organized by type
- **src/components/**: UI components organized by feature area
- **src/context/**: React context providers for state management
- **src/navigation/**: Navigation configuration files
  - **AppNavigator.js**: Navigation for authenticated users
  - **AuthNavigator.js**: Navigation for authentication screens
  - **RootNavigator.js**: Root navigation handling auth state
- **src/services/**: 
  - **api.js**: API service for backend communication
  - **storage.js**: Local storage utilities
- **src/utils/**: Helper functions for formatting, validation, etc.

## Setup Instructions

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- Expo CLI
- Android Studio (for Android development)
- Xcode (for iOS development, Mac only)

### Installation

1. Clone the repository:
```bash
git clone https://github.com/your-org/dass-spring-2025-project-team-2.git
cd dass-spring-2025-project-team-2/code/app/MyApp
```

2. Install dependencies:
```bash
npm install
```

3. Install Expo CLI globally (if not already installed):
```bash
npm install -g expo-cli
```

## Running the App

### Development Mode

Start the development server:
```bash
npm start
```
This will open the Expo developer tools in your browser. You can:
- Scan the QR code with the Expo Go app on your device
- Press 'a' to open on an Android emulator
- Press 'i' to open on an iOS simulator (Mac only)

For Expo-Go App:expo
1. Change extra.apiUrl in app.json to Backend_IP:Port 
2. Type Command:
```bash
npx expo start
```
3. Scan QR Code on Expo App
4. Wait for building, Test App


### Building for Production

To create a production build:

```bash
expo build:android  # For Android APK/App Bundle
expo build:ios      # For iOS (requires Apple Developer account)
```

## Environment Configuration

The app uses the following configuration:
- API URL: Set in app.json under `expo.extra.apiUrl`
- Current endpoint: `http://192.168.167.161:5000/api`

To modify the API endpoint, update the `apiUrl` value in app.json.

## Features

The app provides the following key features:
- User authentication
- Dashboard with financial overview
- Invoice management
- E-Way Bill generation and tracking
- ECR (Electronic Cash Register) functionality
- Document scanning and upload
- Tax filings management
- User profile management
- Customer support

## Additional Information

For more details about the project, please refer to the main README in the project root directory.