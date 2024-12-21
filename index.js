require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const helmet = require('helmet');
const morgan = require('morgan');
const cluster = require('cluster');
const os = require('os');
const multer = require('multer');
const path = require('path');
const { exec } = require('child_process');

// Load environment variables
const PORT = process.env.PORT || 3000;

// Check if the current process is the master process
if (cluster.isPrimary) {
  const numCPUs = os.cpus().length;
  console.log(`Master process ${process.pid} is running`);

  // Fork workers
  for (let i = 0; i < numCPUs; i++) {
    cluster.fork();
  }

  // Listen for workers exiting
  cluster.on('exit', (worker, code, signal) => {
    console.log(`Worker ${worker.process.pid} died. Starting a new worker...`);
    cluster.fork();
  });
} else {
  const app = express();

  // Middleware
  app.use(helmet()); // Security
  app.use(cors()); // CORS support
  app.use(bodyParser.json()); // Parse JSON request bodies
  app.use(bodyParser.urlencoded({ extended: true })); // Parse URL-encoded request bodies
  app.use(morgan('tiny')); // HTTP request logging

  // Static files middleware for the `public` directory
  app.use('/public', express.static(path.join(__dirname, 'public')));

  // Multer configuration for file uploads
  const storage = multer.diskStorage({
    destination: (req, file, cb) => {
      const uploadPath = path.join(__dirname, 'public', req.body.path || '/uploads');
      cb(null, uploadPath);
    },
    filename: (req, file, cb) => {
      cb(null, `${Date.now()}-${file.originalname}`);
    },
  });
  const upload = multer({ storage });

  // Routes
  app.get('/', (req, res) => {
    res.send({ message: 'Welcome to the Clustered Node.js App' });
  });

  app.post('/store', upload.single('file'), (req, res) => {
    const filePath = path.join(__dirname, 'public', req.body.path || '/uploads', req.file.filename);

    // Execute the script with the file path
    exec(`bash your-script.sh "${filePath}"`, (error, stdout, stderr) => {
      if (error) {
        console.error(`Error executing script: ${error.message}`);
        return res.status(500).send({ error: 'Script execution failed', details: error.message });
      }

      res.send({
        message: 'File uploaded and script executed successfully!',
        filePath,
        scriptOutput: stdout.trim(),
      });
    });
  });

  // Start the server
  app.listen(PORT, () => {
    console.log(`Worker ${process.pid} started and listening on port ${PORT}`);
  });
}

