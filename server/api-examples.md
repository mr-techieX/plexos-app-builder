# API Usage Examples

This file contains examples of how to use the Plexos App Builder API using curl commands.

## Prerequisites

1. Start the server: `npm start`
2. The server will run on `http://localhost:5000`

## Examples

### 1. Health Check

```bash
curl -X GET http://localhost:5000/api/health
```

### 2. Upload Database File

```bash
curl -X POST http://localhost:5000/api/upload-reference-db \
  -F "file=@path/to/your/references.db"
```

### 3. Get Object Classes

```bash
curl -X POST http://localhost:5000/api/getObjectClasses \
  -H "Content-Type: application/json" \
  -d '{
    "dbPath": "./uploads/references.db"
  }'
```

### 4. Get Class IDs

```bash
curl -X POST http://localhost:5000/api/getClassIds \
  -H "Content-Type: application/json" \
  -d '{
    "childObjectName": "Solar-1",
    "parentObjectName": "System",
    "dbPath": "./uploads/references.db"
  }'
```

### 5. Get Properties

```bash
curl -X POST http://localhost:5000/api/getProperties \
  -H "Content-Type: application/json" \
  -d '{
    "classLangId": 22,
    "dbPath": "./uploads/references.db"
  }'
```

### 6. Create Configuration

```bash
curl -X POST http://localhost:5000/api/create-configuration \
  -H "Content-Type: application/json" \
  -d '{
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
    "dbPath": "./uploads/references.db"
  }'
```

### 7. List Configurations

```bash
curl -X GET http://localhost:5000/api/configurations
```

### 8. Download Configuration

```bash
curl -X GET http://localhost:5000/api/download/app-1704067200000.json \
  -o downloaded-config.json
```

## Complete Workflow Example

Here's a complete workflow using curl commands:

```bash
# 1. Check server health
curl -X GET http://localhost:5000/api/health

# 2. Upload database
curl -X POST http://localhost:5000/api/upload-reference-db \
  -F "file=@references.db"

# 3. Get object classes
curl -X POST http://localhost:5000/api/getObjectClasses \
  -H "Content-Type: application/json" \
  -d '{"dbPath": "./uploads/references.db"}'

# 4. Get class IDs for objects
curl -X POST http://localhost:5000/api/getClassIds \
  -H "Content-Type: application/json" \
  -d '{
    "childObjectName": "Solar-1",
    "parentObjectName": "System",
    "dbPath": "./uploads/references.db"
  }'

# 5. Get properties for child class
curl -X POST http://localhost:5000/api/getProperties \
  -H "Content-Type: application/json" \
  -d '{
    "classLangId": 22,
    "dbPath": "./uploads/references.db"
  }'

# 6. Create final configuration
curl -X POST http://localhost:5000/api/create-configuration \
  -H "Content-Type: application/json" \
  -d '{
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
    "dbPath": "./uploads/references.db"
  }'

# 7. List generated configurations
curl -X GET http://localhost:5000/api/configurations

# 8. Download the configuration file
curl -X GET http://localhost:5000/api/download/app-1704067200000.json \
  -o my-config.json
```

## Error Handling

All endpoints return appropriate HTTP status codes and error messages:

```bash
# Example of a 400 error response
curl -X POST http://localhost:5000/api/getClassIds \
  -H "Content-Type: application/json" \
  -d '{"dbPath": "./uploads/references.db"}'
# Response: {"error": "Missing required parameters"}
```

## Testing

You can test the API using the provided test script:

```bash
npm test
```

This will run basic tests against the API endpoints. 