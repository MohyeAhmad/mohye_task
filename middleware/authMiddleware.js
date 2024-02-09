const jwt = require('jsonwebtoken');

// Token verification middleware
const authenticateToken = (req, res, next) => {
  // Retrieve the token from the request headers or query parameters
  const token = req.headers.authorization || req.body.token;

  if (!token) {
   
    return res.status(401).json({ message: 'Authorization token not provided' });
  }

  try {
    
    const decoded = jwt.verify(token, 'your-secret-key');
    req.userId = decoded.userId; 
    req.role = decoded.role;
    req.roleName = decoded.roleName;
    next(); 
  } catch (error) {
   
    return res.status(401).json({ message: 'Invalid or expired token' + error });
  }
};

module.exports = authenticateToken;