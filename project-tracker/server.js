const express = require('express');
const { MongoClient, ObjectId } = require('mongodb');
const path = require('path');

const app = express();
const port = 3000;

// MongoDB connection string
const uri = 'mongodb+srv://2003anzori:D6VMwUS0BYQEY2zP@cluster0.xv4ok.mongodb.net/project_tracker?retryWrites=true&w=majority&appName=Cluster0';
const client = new MongoClient(uri);

// Middleware to parse JSON requests
app.use(express.json());
app.use(express.static(__dirname)); // Serve static files (like index.html)

// Connect to MongoDB once at startup
let db;
async function connectToMongo() {
  try {
    await client.connect();
    db = client.db();
    console.log('Connected to MongoDB');
  } catch (error) {
    console.error('MongoDB connection error:', error);
    process.exit(1);
  }
}
connectToMongo();

// Serve index.html
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// API Routes
// Get all projects
app.get('/api/projects', async (req, res) => {
  try {
    const collection = db.collection('projects');
    const projects = await collection.find({}).toArray();
    res.status(200).json(projects);
  } catch (error) {
    console.error('Error fetching projects:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Add a new project
app.post('/api/projects', async (req, res) => {
  try {
    const projectData = req.body;
    const collection = db.collection('projects');
    const result = await collection.insertOne(projectData);
    const insertedProject = { _id: result.insertedId, ...projectData };
    res.status(201).json(insertedProject);
  } catch (error) {
    console.error('Error adding project:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Update a project
app.put('/api/projects/:id', async (req, res) => {
  try {
    const id = req.params.id;
    const projectData = req.body;
    const collection = db.collection('projects');
    const result = await collection.updateOne(
      { _id: new ObjectId(id) },
      { $set: projectData }
    );
    if (result.matchedCount === 0) {
      res.status(404).json({ message: 'Project not found' });
    } else {
      const updatedProject = { _id: id, ...projectData };
      res.status(200).json(updatedProject);
    }
  } catch (error) {
    console.error('Error updating project:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Delete a project
app.delete('/api/projects/:id', async (req, res) => {
  try {
    const id = req.params.id;
    const collection = db.collection('projects');
    const result = await collection.deleteOne({ _id: new ObjectId(id) });
    if (result.deletedCount === 0) {
      res.status(404).json({ message: 'Project not found' });
    } else {
      res.status(204).end();
    }
  } catch (error) {
    console.error('Error deleting project:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Start the server
app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});