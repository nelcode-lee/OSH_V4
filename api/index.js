// Simple API for demo purposes
export default function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Credentials', true)
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT')
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization')

  if (req.method === 'OPTIONS') {
    res.status(200).end()
    return
  }

  const { pathname } = new URL(req.url, `http://${req.headers.host}`)
  
  // Health check
  if (pathname === '/health' || pathname === '/api/health') {
    return res.status(200).json({ status: 'healthy', version: '1.0.0' })
  }

  // Mock authentication
  if (pathname === '/api/auth/login' && req.method === 'POST') {
    let username, password;
    
    // Handle both JSON and form-encoded data
    if (req.headers['content-type'] === 'application/json') {
      ({ username, password } = req.body);
    } else if (req.headers['content-type'] === 'application/x-www-form-urlencoded') {
      const body = req.body;
      username = body.username;
      password = body.password;
    } else {
      return res.status(400).json({ detail: 'Invalid content type' });
    }
    
    // Demo credentials
    const demoUsers = {
      'instructor@example.com': { role: 'instructor', password: 'password123' },
      'student@example.com': { role: 'student', password: 'password123' },
      'admin@example.com': { role: 'admin', password: 'password123' }
    }
    
    const user = demoUsers[username]
    if (user && user.password === password) {
      // Mock JWT token
      const token = Buffer.from(JSON.stringify({ 
        sub: username, 
        role: user.role,
        exp: Date.now() + 3600000 
      })).toString('base64')
      
      return res.status(200).json({
        access_token: token,
        token_type: 'bearer'
      })
    }
    
    return res.status(401).json({ detail: 'Incorrect email or password' })
  }

  // Mock user profile
  if (pathname === '/api/auth/me' && req.method === 'GET') {
    const authHeader = req.headers.authorization
    if (!authHeader) {
      return res.status(401).json({ detail: 'Not authenticated' })
    }
    
    try {
      const token = authHeader.replace('Bearer ', '')
      const payload = JSON.parse(Buffer.from(token, 'base64').toString())
      
      return res.status(200).json({
        id: 1,
        email: payload.sub,
        role: payload.role,
        is_active: true,
        created_at: new Date().toISOString()
      })
    } catch (error) {
      return res.status(401).json({ detail: 'Invalid token' })
    }
  }

  // Mock courses data
  if (pathname === '/api/courses/' && req.method === 'GET') {
    return res.status(200).json([
      {
        id: 1,
        title: "Plant Training & Testing",
        description: "CPCS and NPORS plant training and technical tests for excavator, roller, dumpers, dozer, telehandler and wheeled loading shovels.",
        category: "Plant Training",
        duration: "1-5 Days",
        price: "From £200",
        rating: 4.9,
        students_trained: 2500
      },
      {
        id: 2,
        title: "Health & Safety Short Course",
        description: "Designed to keep people safe on site, covering topics including the people plant interface.",
        category: "Health & Safety",
        duration: "1 Day",
        price: "£150",
        rating: 4.8,
        students_trained: 3200
      }
    ])
  }

  // Mock instructor dashboard
  if (pathname === '/api/courses/instructor-dashboard' && req.method === 'GET') {
    return res.status(200).json({
      total_courses: 12,
      active_students: 45,
      completed_courses: 8,
      pending_requests: 3
    })
  }

  // Default response
  res.status(404).json({ detail: 'Not found' })
}
