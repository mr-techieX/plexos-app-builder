# PLEXOS App Builder

A complete web application for creating PLEXOS JSON configurations with a modern React frontend and Express backend.

## 🚀 Quick Start

### Prerequisites
- Node.js (version 14 or higher)
- npm or yarn

### Installation

1. **Clone or download the project**
2. **Install all dependencies**:
   ```bash
   npm run install-all
   ```

3. **Start both frontend and backend**:
   ```bash
   npm start
   ```

4. **Access the application**:
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:5000

## 📁 Project Structure

```
plexos-app-builder/
├── client/                 # React frontend
│   ├── public/
│   ├── src/
│   │   ├── components/     # Reusable UI components
│   │   ├── pages/         # Main application pages
│   │   ├── services/      # API communication
│   │   └── index.css      # Global styles
│   ├── package.json
│   └── tailwind.config.js
├── server/                 # Express backend
│   ├── uploads/           # Database file uploads
│   ├── output/            # Generated JSON files
│   ├── templates/         # JSON templates
│   ├── index.js           # Main server file
│   └── package.json
├── package.json           # Root package.json
└── README.md             # This file
```

## 🛠️ Development

### Running Individual Services

**Backend only:**
```bash
npm run server
```

**Frontend only:**
```bash
npm run client
```

**Both together:**
```bash
npm start
```

### Available Scripts

- `npm start` - Start both frontend and backend
- `npm run server` - Start backend only
- `npm run client` - Start frontend only
- `npm run install-all` - Install dependencies for all packages
- `npm run build` - Build frontend for production

## 🔧 Features

### Frontend (React)
- **Modern UI**: Professional design with Tailwind CSS
- **Step-by-Step Wizard**: 5-step configuration process
- **File Upload**: Drag-and-drop database upload
- **Dynamic Forms**: Real-time validation and error handling
- **Progress Tracking**: Visual progress indicators
- **Responsive Design**: Works on all devices

### Backend (Express)
- **Database Upload**: Handle SQLite database files
- **Schema Discovery**: Automatically detect table structure
- **API Endpoints**: RESTful API for all operations
- **File Generation**: Create JSON configurations
- **Error Handling**: Comprehensive error management

## 📋 API Endpoints

### Database Management
- `POST /api/upload-reference-db` - Upload database file
- `POST /api/discover-schema` - Discover database schema

### Object Management
- `POST /api/getObjectClasses` - Get available object classes
- `POST /api/getClassIds` - Get class IDs for objects
- `POST /api/getProperties` - Get properties for a class

### Configuration
- `POST /api/create-configuration` - Generate JSON configuration
- `GET /api/configurations` - List generated configurations
- `GET /api/download/:fileName` - Download configuration file

### System
- `GET /api/health` - Health check

## 🗄️ Database Requirements

The application expects SQLite database files with tables containing object classes and properties. The backend automatically detects common table name variations:

**Class Tables**: `ObjectClass`, `objectclass`, `OBJECTCLASS`, `Classes`, `classes`, `CLASSES`
**Property Tables**: `Property`, `property`, `PROPERTY`, `Properties`, `properties`, `PROPERTIES`

## 🎯 Usage Workflow

1. **Start the application**: `npm start`
2. **Open browser**: Navigate to http://localhost:3000
3. **Enter basic information**: Study ID, Changeset ID, Model Info, Dashboard ID
4. **Upload database**: Upload your SQLite database file
5. **Configure objects**: Add objects and their properties
6. **Set run configuration**: Choose engine version and resources
7. **Generate configuration**: Create and download JSON file

## 🐛 Troubleshooting

### Common Issues

**Port already in use:**
- Frontend: Change port in client/package.json or use `PORT=3001 npm run client`
- Backend: Change port in server/index.js or use `PORT=5001 npm run server`

**Database upload fails:**
- Ensure your database file is a valid SQLite file
- Check that the database contains the required tables
- Verify file permissions

**Frontend can't connect to backend:**
- Ensure backend is running on port 5000
- Check CORS settings in server/index.js
- Verify API base URL in client/src/services/api.js

### Getting Help

1. Check the console for error messages
2. Verify all dependencies are installed: `npm run install-all`
3. Restart both services: `npm start`
4. Check the health endpoint: http://localhost:5000/api/health

## 📝 License

This project is licensed under the MIT License.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request 