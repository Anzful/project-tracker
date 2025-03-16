const { MongoClient, ObjectId } = require('mongodb');

const uri = 'mongodb+srv://2003anzori:D6VMwUS0BYQEY2zP@cluster0.xv4ok.mongodb.net/project_tracker?retryWrites=true&w=majority&appName=Cluster0';

module.exports = async (req, res) => {
  const client = new MongoClient(uri);
  try {
    await client.connect();
    const db = client.db();
    const collection = db.collection('projects');
    const id = req.query.id;

    if (req.method === 'PUT') {
      const projectData = req.body;
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
    } else if (req.method === 'DELETE') {
      const result = await collection.deleteOne({ _id: new ObjectId(id) });
      if (result.deletedCount === 0) {
        res.status(404).json({ message: 'Project not found' });
      } else {
        res.status(204).end();
      }
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