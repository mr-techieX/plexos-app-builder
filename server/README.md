# Plexos App Builder Backend

This backend service provides APIs for creating JSON configurations from uploaded database files. It handles the complete workflow from database upload to final JSON generation.

## Features

- Upload and validate SQLite database files
- Fetch object classes and their properties
- Get class IDs for child and parent objects
- Create JSON configurations with proper structure
- Download generated configuration files
- Health check endpoint

## API Endpoints

### 1. Health Check
```
GET /api/health
```
Returns server status and directory information.

**Response:**
```json
{
  "status": "OK",
  "timestamp": "2024-01-01T00:00:00.000Z",
  "uploadsDir": true,
  "outputDir": true
}
```

### 2. Upload Reference Database
```
POST /api/upload-reference-db
Content-Type: multipart/form-data
```
Upload a SQLite database file (.db) for processing.

**Request:**
- `file`: SQLite database file (must be .db extension)

**Response:**
```json
{
  "message": "Reference DB uploaded successfully",
  "dbPath": "/path/to/uploads/references.db"
}
```

### 3. Get Object Classes
```
POST /api/getObjectClasses
Content-Type: application/json
```
Get all available object classes from the database for dropdown selection.

**Request:**
```json
{
  "dbPath": "/path/to/uploads/references.db"
}
```

**Response:**
```json
{
  "objectClasses": [
    {
      "ClassLangID": 1,
      "Name": "System",
      "Description": "System object"
    }
  ],
  "count": 1
}
```

### 4. Get Class IDs
```
POST /api/getClassIds
Content-Type: application/json
```
Get class IDs for child and parent objects by their names.

**Request:**
```json
{
  "childObjectName": "Solar-1",
  "parentObjectName": "System",
  "dbPath": "/path/to/uploads/references.db"
}
```

**Response:**
```json
{
  "childClassLangId": 22,
  "parentClassLangId": 1,
  "childObjectName": "Solar-1",
  "parentObjectName": "System"
}
```

### 5. Get Properties
```
POST /api/getProperties
Content-Type: application/json
```
Get all properties for a specific class.

**Request:**
```json
{
  "classLangId": 22,
  "dbPath": "/path/to/uploads/references.db"
}
```

**Response:**
```json
{
  "properties": [
    {
      "PropertyLangID": 812,
      "Name": "Capacity",
      "Description": "Capacity property"
    }
  ],
  "count": 1
}
```

### 6. Create Configuration
```
POST /api/create-configuration
Content-Type: application/json
```
Create the final JSON configuration file.

**Request:**
```json
{
  "studyId": "d499d898-17be-4e81-b0e8-23755b196d29",
  "changesetId": "9b22be43-fa1c-4aab-8810-d6bfe1343fbd",
  "modelInfo": {
    "name": "Long Term- 25 years-State 1",
    "displayName": "LT-25 years State 1"
  },
  "dashboardId": "33c709f2-3054-4548-9e44-9c71cf602758",
  "objects": [
    {
      "childObjectName": "Solar-1",
      "childClassLangId": 22,
      "parentClassLangId": 1,
      "parentObjectName": "System",
      "properties": [
        {
          "propertyLangId": 812,
          "type": 0
        }
      ]
    }
  ],
  "runConfiguration": {
    "engineVersion": "10.0 R07",
    "operatingSystem": "Linux",
    "cores": 2,
    "memory": "16GB"
  },
  "dbPath": "/path/to/uploads/references.db"
}
```

**Response:**
```json
{
  "message": "JSON configuration created successfully",
  "fileName": "app-1704067200000.json",
  "filePath": "/path/to/output/app-1704067200000.json",
  "configuration": { ... }
}
```

### 7. List Configurations
```
GET /api/configurations
```
Get list of all generated configuration files.

**Response:**
```json
{
  "configurations": [
    {
      "fileName": "app-1704067200000.json",
      "filePath": "/path/to/output/app-1704067200000.json",
      "createdAt": "2024-01-01T00:00:00.000Z"
    }
  ]
}
```

### 8. Download Configuration
```
GET /api/download/:fileName
```
Download a specific configuration file.

**Response:** File download

## Complete Workflow

1. **Upload Database**: Upload a SQLite database file using `/api/upload-reference-db`
2. **Get Object Classes**: Fetch available object classes using `/api/getObjectClasses`
3. **Get Class IDs**: For each object pair, get their class IDs using `/api/getClassIds`
4. **Get Properties**: For each class, fetch available properties using `/api/getProperties`
5. **Create Configuration**: Build the final JSON configuration using `/api/create-configuration`
6. **Download**: Download the generated configuration file using `/api/download/:fileName`

## Database Schema Requirements

The uploaded SQLite database must contain the following tables:

### ObjectClass Table
- `ClassLangID` (INTEGER): Primary key
- `Name` (TEXT): Object class name
- `Description` (TEXT): Object class description

### Property Table
- `PropertyLangID` (INTEGER): Primary key
- `ClassLangID` (INTEGER): Foreign key to ObjectClass
- `Name` (TEXT): Property name
- `Description` (TEXT): Property description

## Error Handling

All endpoints return appropriate HTTP status codes:
- `200`: Success
- `400`: Bad Request (missing parameters, invalid file)
- `404`: Not Found (object not found in database)
- `500`: Internal Server Error

Error responses include a descriptive message:
```json
{
  "error": "Error description",
  "details": "Additional error details"
}
```

## Installation and Setup

1. Install dependencies:
```bash
npm install
```

2. Start the server:
```bash
npm start
```

The server will run on port 5000 by default, or the port specified in the `PORT` environment variable.

## Directory Structure

```
server/
├── index.js              # Main server file
├── uploads/              # Uploaded database files
├── output/               # Generated JSON configurations
├── templates/            # JSON templates
└── README.md            # This file
```

## Environment Variables

- `PORT`: Server port (default: 5000) 