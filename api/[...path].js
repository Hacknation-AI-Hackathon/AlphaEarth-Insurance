// Catch-all route handler for Node.js backend API routes
// This ensures all routes under /api/* are handled by the Express app

import app from './index.js';

export default function handler(req, res) {
  return app(req, res);
}

