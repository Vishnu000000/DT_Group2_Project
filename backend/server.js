const express = require('express');
const cors = require('cors');
const datasetRoutes = require('./routes/datasetRoutes');
const { blockchainService } = require('./services');
require('dotenv').config();

console.log('Starting server...');

const app = express();

// Middleware
app.use(cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Root route
app.get('/', (req, res) => {
    console.log('Root route accessed');
    res.json({
        message: 'Dataset Manager API',
        version: '1.0.0',
        status: 'running',
        timestamp: new Date().toISOString(),
        endpoints: {
            datasets: {
                list: {
                    method: 'GET',
                    path: '/api/datasets',
                    description: 'Get all datasets'
                },
                count: {
                    method: 'GET',
                    path: '/api/datasets/count',
                    description: 'Get total number of datasets'
                },
                upload: {
                    method: 'POST',
                    path: '/api/datasets/upload',
                    description: 'Upload a new dataset',
                    body: {
                        file: 'File to upload',
                        name: 'Dataset name',
                        description: 'Dataset description',
                        licenseType: 'Type of license',
                        price: 'Price in wei'
                    }
                },
                get: {
                    method: 'GET',
                    path: '/api/datasets/:datasetId',
                    description: 'Get dataset details'
                },
                file: {
                    method: 'GET',
                    path: '/api/datasets/:datasetId/file',
                    description: 'Get dataset file (requires license)'
                },
                purchase: {
                    method: 'POST',
                    path: '/api/datasets/purchase/:datasetId',
                    description: 'Purchase a dataset license'
                }
            }
        }
    });
});

// Routes
app.use('/api/datasets', datasetRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
    console.error('Error:', err.stack);
    
    // Handle specific error types
    if (err.name === 'ValidationError') {
        return res.status(400).json({
            error: 'Validation Error',
            message: err.message,
            details: err.errors
        });
    }
    
    if (err.name === 'UnauthorizedError') {
        return res.status(401).json({
            error: 'Unauthorized',
            message: err.message
        });
    }
    
    // Default error response
    res.status(500).json({ 
        error: 'Internal Server Error',
        message: err.message,
        timestamp: new Date().toISOString()
    });
});

const PORT = process.env.PORT || 5000;

// Start server
const server = app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
    console.log(`API documentation available at http://localhost:${PORT}`);
    console.log('Press Ctrl+C to stop the server');
});

// Handle server errors
server.on('error', (error) => {
    if (error.code === 'EADDRINUSE') {
        console.error(`Port ${PORT} is already in use. Please use a different port.`);
        process.exit(1);
    } else {
        console.error('Server error:', error);
    }
}); 