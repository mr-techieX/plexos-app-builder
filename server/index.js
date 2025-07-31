const express = require('express');
const multer = require('multer');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const cors = require('cors');
const fs = require('fs');

const app = express();

app.use(cors());
app.use(express.json());

// Configure multer storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, 'uploads');
    if (!fs.existsSync(uploadDir)){
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    cb(null, 'references.db');
  }
});

const upload = multer({ 
  storage: storage,
  fileFilter: (req, file, cb) => {
    if (file.originalname.endsWith('.db')) {
      cb(null, true);
    } else {
      cb(new Error('Only .db files are allowed'));
    }
  }
});

// Database connection helper
const connectToDatabase = (dbPath) => {
  return new Promise((resolve, reject) => {
    const db = new sqlite3.Database(dbPath, (err) => {
      if (err) {
        reject(err);
      } else {
        resolve(db);
      }
    });
  });
};

// Add a specific endpoint for reference DB upload
app.post('/api/upload-reference-db', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const dbPath = path.join(__dirname, 'uploads', 'references.db');
    
    // Test database connection and discover schema
    try {
      const db = await connectToDatabase(dbPath);
      
      // Get all tables in the database
      const getAllTablesQuery = `
        SELECT name FROM sqlite_master 
        WHERE type='table'
      `;
      
      db.all(getAllTablesQuery, [], (err, tables) => {
        if (err) {
          db.close();
          return res.status(400).json({ error: 'Invalid database file' });
        }
        
        console.log('Available tables:', tables.map(t => t.name));
        
        // Check for the required tables in your schema
        const requiredTables = ['t_class', 't_collection', 't_property', 't_object', 't_membership'];
        const foundTables = requiredTables.filter(tableName => 
          tables.find(t => t.name === tableName)
        );
        
        if (foundTables.length !== requiredTables.length) {
          const missingTables = requiredTables.filter(tableName => 
            !tables.find(t => t.name === tableName)
          );
          
          db.close();
          return res.status(400).json({ 
            error: 'Database schema not recognized',
            details: {
              availableTables: tables.map(t => t.name),
              missingTables: missingTables,
              requiredTables: requiredTables
            }
          });
        }
        
        // Store the schema for later use
        global.dbSchema = {
          t_class: 't_class',
          t_collection: 't_collection', 
          t_property: 't_property',
          t_object: 't_object',
          t_membership: 't_membership'
        };
        
        db.close();
        
        res.json({ 
          message: 'Reference DB uploaded successfully',
          dbPath: dbPath,
          schema: global.dbSchema
        });
      });
    } catch (dbError) {
      return res.status(400).json({ error: 'Invalid database file' });
    }

  } catch (err) {
    console.error('Upload error:', err);
    res.status(500).json({ 
      error: 'File upload failed',
      details: err.message 
    });
  }
});

// Get class IDs based on object names and class names
app.post('/api/getClassIds', async (req, res) => {
  const { childObjectName, childClassName, parentObjectName = 'System', dbPath } = req.body;
  
  if (!childObjectName || !childClassName || !dbPath) {
    return res.status(400).json({ error: 'Missing required parameters: childObjectName, childClassName' });
  }
  
  if (!global.dbSchema) {
    return res.status(400).json({ error: 'Database schema not initialized. Please upload database first.' });
  }
  
  try {
    const db = await connectToDatabase(dbPath);
    
    // Find child class by name in t_class table
    const childClassQuery = `
      SELECT lang_id, class_id, name 
      FROM ${global.dbSchema.t_class} 
      WHERE name = ?
    `;

    db.get(childClassQuery, [childClassName], (err, childClassRow) => {
      if (err) {
        db.close();
        return res.status(500).json({ error: err.message });
      }

      if (!childClassRow) {
        db.close();
        return res.status(404).json({ error: `Child class '${childClassName}' not found in t_class table` });
      }

      // For parent, we'll use System with class_id = 1 (assuming System is always class_id = 1)
      // You can modify this logic if System has a different class_id
      const parentClassLangId = 1; // Default for System
      
      res.json({
        childClassLangId: childClassRow.lang_id,
        parentClassLangId: parentClassLangId,
        childObjectName: childObjectName,
        parentObjectName: parentObjectName,
        childClassId: childClassRow.class_id, // Store for later use
        childClassName: childClassRow.name
      });
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get properties for a class based on child class ID and parent class ID
app.post('/api/getProperties', async (req, res) => {
  const { childClassId, parentClassId = 1, dbPath } = req.body;

  if (!childClassId || !dbPath) {
    return res.status(400).json({ error: 'Missing required parameters: childClassId' });
  }

  if (!global.dbSchema) {
    return res.status(400).json({ error: 'Database schema not initialized. Please upload database first.' });
  }

  try {
    const db = await connectToDatabase(dbPath);
    
    // Step 1: Find collection_id from t_collection table
    // Match child_class_id with the provided childClassId and parent_class_id with parentClassId
    const collectionQuery = `
      SELECT collection_id 
      FROM ${global.dbSchema.t_collection} 
      WHERE child_class_id = ? AND parent_class_id = ?
    `;

    db.get(collectionQuery, [childClassId, parentClassId], (err, collectionRow) => {
      if (err) {
        db.close();
        return res.status(500).json({ error: err.message });
      }

      if (!collectionRow) {
        db.close();
        return res.status(404).json({ 
          error: `No collection found for child_class_id=${childClassId} and parent_class_id=${parentClassId}` 
        });
      }

      // Step 2: Get properties from t_property table based on collection_id
      const propertiesQuery = `
        SELECT lang_id as PropertyLangID, name as Name, description as Description
        FROM ${global.dbSchema.t_property} 
        WHERE collection_id = ?
        ORDER BY name
      `;

      db.all(propertiesQuery, [collectionRow.collection_id], (err, rows) => {
        db.close();
        
        if (err) {
          return res.status(500).json({ error: err.message });
        }
        
        res.json({
          properties: rows,
          count: rows.length,
          collectionId: collectionRow.collection_id
        });
      });
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get all available object classes for dropdown
app.post('/api/getObjectClasses', async (req, res) => {
  const { dbPath } = req.body;

  if (!dbPath) {
    return res.status(400).json({ error: 'Missing database path' });
  }

  if (!global.dbSchema) {
    return res.status(400).json({ error: 'Database schema not initialized. Please upload database first.' });
  }

  try {
    const db = await connectToDatabase(dbPath);
    
    const query = `
      SELECT lang_id as ClassLangID, name as Name, description as Description
      FROM ${global.dbSchema.t_class} 
      ORDER BY name
    `;

    db.all(query, [], (err, rows) => {
      db.close();
      
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      
      res.json({
        objectClasses: rows,
        count: rows.length
      });
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Create the final JSON configuration
app.post('/api/create-configuration', async (req, res) => {
  try {
    const {
      studyId,
      changesetId,
      modelInfo,
      dashboardId,
      objects,
      runConfiguration,
      dbPath
    } = req.body;

    if (!studyId || !changesetId || !modelInfo || !dashboardId || !objects || !runConfiguration || !dbPath) {
      return res.status(400).json({ error: 'Missing required parameters' });
    }

    // Validate that the database file exists
    if (!fs.existsSync(dbPath)) {
      return res.status(400).json({ error: 'Database file not found' });
    }

    // Create the JSON configuration
    const appJson = {
      studyId: studyId,
      changesetId: changesetId,
      modelInfo: modelInfo,
      buttonsConfig: [
        {
          name: "save",
          displayName: "Save"
        },
        {
          name: "run",
          displayName: "Run App"
        }
      ],
      inputProperties: objects.map(obj => ({
        childObjectName: obj.childObjectName,
        childClassLangId: obj.childClassLangId,
        parentClassLangId: obj.parentClassLangId,
        parentObjectName: obj.parentObjectName,
        properties: obj.properties.map(prop => ({
          propertyLangId: prop.propertyLangId,
          type: prop.type
        }))
      })),
      dashboards: [
        {
          configId: dashboardId
        }
      ],
      horizon: {
        enabled: true
      },
      runConfig: {
        engine: {
          displayName: runConfiguration.engineVersion || "10.0 R07",
          operatingSystem: runConfiguration.operatingSystem || "Linux"
        },
        workerPool: {
          os: runConfiguration.operatingSystem || "Linux",
          cores: runConfiguration.cores || 2,
          memory: runConfiguration.memory || "16GB"
        }
      }
    };

    // Save the JSON file
    const outputDir = path.join(__dirname, 'output');
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    const fileName = `app-${Date.now()}.json`;
    const filePath = path.join(outputDir, fileName);
    
    fs.writeFileSync(filePath, JSON.stringify(appJson, null, 2));

    res.json({ 
      message: 'JSON configuration created successfully',
      fileName: fileName,
      filePath: filePath,
      configuration: appJson
    });

  } catch (err) {
    console.error('Configuration creation error:', err);
    res.status(500).json({ 
      error: 'Failed to create configuration',
      details: err.message 
    });
  }
});

// Get list of generated configurations
app.get('/api/configurations', (req, res) => {
  try {
    const outputDir = path.join(__dirname, 'output');
    
    if (!fs.existsSync(outputDir)) {
      return res.json({ configurations: [] });
    }

    const files = fs.readdirSync(outputDir)
      .filter(file => file.endsWith('.json'))
      .map(file => ({
        fileName: file,
        filePath: path.join(outputDir, file),
        createdAt: fs.statSync(path.join(outputDir, file)).mtime
      }))
      .sort((a, b) => b.createdAt - a.createdAt);

    res.json({ configurations: files });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Download a specific configuration file
app.get('/api/download/:fileName', (req, res) => {
  try {
    const fileName = req.params.fileName;
    const filePath = path.join(__dirname, 'output', fileName);
    
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ error: 'File not found' });
    }

    res.download(filePath);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Delete uploaded database file
app.delete('/api/delete-uploaded-db', (req, res) => {
  try {
    const dbPath = path.join(__dirname, 'uploads', 'references.db');
    
    if (fs.existsSync(dbPath)) {
      fs.unlinkSync(dbPath);
      console.log('Uploaded database file deleted');
    }
    
    // Reset global schema
    global.dbSchema = null;
    
    res.json({ 
      message: 'Uploaded database file deleted successfully',
      dbPath: dbPath
    });
  } catch (err) {
    console.error('Error deleting database file:', err);
    res.status(500).json({ 
      error: 'Failed to delete database file',
      details: err.message 
    });
  }
});

// Discover database schema
app.post('/api/discover-schema', async (req, res) => {
  const { dbPath } = req.body;
  
  if (!dbPath) {
    return res.status(400).json({ error: 'Missing database path' });
  }

  try {
    const db = await connectToDatabase(dbPath);
    
    // Get all tables in the database
    const getAllTablesQuery = `
      SELECT name FROM sqlite_master 
      WHERE type='table'
    `;
    
    db.all(getAllTablesQuery, [], (err, tables) => {
      if (err) {
        db.close();
        return res.status(500).json({ error: 'Failed to read database schema' });
      }
      
      console.log('Available tables:', tables.map(t => t.name));
      
      // Check for the required tables in your schema
      const requiredTables = ['t_class', 't_collection', 't_property', 't_object', 't_membership'];
      const foundTables = requiredTables.filter(tableName => 
        tables.find(t => t.name === tableName)
      );
      
      db.close();
      
      res.json({
        availableTables: tables.map(t => t.name),
        requiredTables: requiredTables,
        foundTables: foundTables,
        missingTables: requiredTables.filter(tableName => 
          !tables.find(t => t.name === tableName)
        ),
        isValid: foundTables.length === requiredTables.length
      });
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    uploadsDir: fs.existsSync(path.join(__dirname, 'uploads')),
    outputDir: fs.existsSync(path.join(__dirname, 'output')),
    dbSchema: global.dbSchema || null
  });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Health check available at: http://localhost:${PORT}/api/health`);
});

module.exports = app;