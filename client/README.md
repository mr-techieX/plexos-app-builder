# PLEXOS App Builder Frontend

A modern, professional React application for creating PLEXOS JSON configurations with an intuitive step-by-step interface.

## Features

### 🎨 Modern UI/UX
- **Professional Design**: Clean, modern interface with Tailwind CSS
- **Step-by-Step Wizard**: Guided workflow through 5 intuitive steps
- **Progress Tracking**: Visual progress indicator showing current step
- **Responsive Design**: Works perfectly on desktop, tablet, and mobile

### 🔧 Interactive Components
- **File Upload**: Drag-and-drop database file upload with progress tracking
- **Dynamic Forms**: Real-time validation and error handling
- **Loading States**: Professional loading spinners and progress bars
- **Notifications**: Success, error, and info notifications with auto-dismiss

### 📊 Data Management
- **Object Configuration**: Add, edit, and remove objects with properties
- **Property Management**: Dynamic property addition with type selection
- **Run Configuration**: Engine version, OS, CPU cores, and memory settings
- **Configuration Generation**: Automatic JSON file creation and download

### 🔗 Backend Integration
- **API Integration**: Seamless communication with the backend API
- **Error Handling**: Comprehensive error handling and user feedback
- **File Download**: Direct download of generated configuration files
- **Database Validation**: Real-time database validation and object class loading

## Technology Stack

- **React 18**: Modern React with hooks and functional components
- **Tailwind CSS**: Utility-first CSS framework for styling
- **Heroicons**: Beautiful SVG icons from the Heroicons library
- **Axios**: HTTP client for API communication
- **React Scripts**: Development and build tools

## Installation

1. **Navigate to the client directory**:
   ```bash
   cd client
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Start the development server**:
   ```bash
   npm start
   ```

4. **Open your browser** and navigate to `http://localhost:3000`

## Project Structure

```
client/
├── public/
│   └── index.html
├── src/
│   ├── components/
│   │   ├── EditableProperty.jsx
│   │   ├── LoadingSpinner.jsx
│   │   ├── Notification.jsx
│   │   └── ProgressBar.jsx
│   ├── pages/
│   │   └── AppBuilderForm.jsx
│   ├── services/
│   │   └── api.js
│   ├── App.js
│   ├── index.js
│   └── index.css
├── package.json
└── tailwind.config.js
```

## Components

### AppBuilderForm
The main application component that handles the entire workflow:

- **Step 1**: Basic Information (Study ID, Changeset ID, Model Info, Dashboard ID)
- **Step 2**: Database Upload (File upload with validation and progress)
- **Step 3**: Objects Configuration (Add/edit objects and their properties)
- **Step 4**: Run Configuration (Engine settings and resource allocation)
- **Step 5**: Success (Download generated configuration)

### LoadingSpinner
Reusable loading component with customizable size and text.

### Notification
Alert component for displaying success, error, warning, and info messages.

### ProgressBar
Progress tracking component for uploads and processing operations.

## API Integration

The frontend communicates with the backend through the following endpoints:

- `POST /api/upload-reference-db` - Upload database file
- `POST /api/getObjectClasses` - Get available object classes
- `POST /api/getClassIds` - Get class IDs for objects
- `POST /api/getProperties` - Get properties for a class
- `POST /api/create-configuration` - Generate JSON configuration
- `GET /api/download/:fileName` - Download configuration file

## Styling

The application uses Tailwind CSS for styling with custom components:

- **Custom Button Classes**: `.btn-primary`, `.btn-secondary`, `.btn-success`, `.btn-danger`
- **Form Input Classes**: `.form-input`, `.form-select`
- **Card Classes**: `.card`, `.card-header`, `.card-body`
- **Alert Classes**: `.alert-success`, `.alert-error`, `.alert-warning`, `.alert-info`

## Development

### Available Scripts

- `npm start` - Start development server
- `npm build` - Build for production
- `npm test` - Run tests
- `npm eject` - Eject from Create React App

### Environment Variables

Create a `.env` file in the client directory:

```env
REACT_APP_API_URL=http://localhost:5000
```

## Features in Detail

### 1. Step-by-Step Wizard
The application guides users through a 5-step process:
1. **Basic Information**: Enter study and model details
2. **Database Upload**: Upload and validate reference database
3. **Objects Configuration**: Configure objects and properties
4. **Run Configuration**: Set engine and resource parameters
5. **Success**: Download generated configuration

### 2. File Upload
- Drag-and-drop interface for database files
- Real-time upload progress tracking
- File validation and error handling
- Success notifications

### 3. Dynamic Object Management
- Add/remove objects dynamically
- Configure object properties with types
- Real-time validation and error handling
- Professional form controls

### 4. Configuration Generation
- Automatic JSON generation
- Download functionality
- Success confirmation
- Error handling and recovery

## Browser Support

- Chrome (recommended)
- Firefox
- Safari
- Edge

## Performance

- **Lazy Loading**: Components load only when needed
- **Optimized Bundles**: Webpack optimization for production
- **Efficient State Management**: React hooks for optimal performance
- **Minimal Dependencies**: Lightweight and fast

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the MIT License. 