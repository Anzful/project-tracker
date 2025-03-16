const { MongoClient } = require('mongodb');

const uri = 'mongodb+srv://2003anzori:D6VMwUS0BYQEY2zP@cluster0.xv4ok.mongodb.net/project_tracker?retryWrites=true&w=majority&appName=Cluster0';

module.exports = async (req, res) => {
  const client = new MongoClient(uri);
  try {
    await client.connect();
    const db = client.db();
    const collection = db.collection('projects');

    if (req.method === 'GET') {
      const projects = await collection.find({}).toArray();
      res.status(200).json(projects);
    } else if (req.method === 'POST') {
      const projectData = req.body;
      const result = await collection.insertOne(projectData);
      const insertedProject = { _id: result.insertedId, ...projectData };
      res.status(201).json(insertedProject);
    } else {
      res.status(405).json({ message: 'Method not allowed' });
    }
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ message: 'Internal server error' });
  } finally {
    await client.close();
  }
};