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
      // Mock JWT token (simplified structure)
      const header = { alg: 'HS256', typ: 'JWT' };
      const payload = { 
        sub: username, 
        role: user.role,
        iat: Math.floor(Date.now() / 1000),
        exp: Math.floor(Date.now() / 1000) + 3600 // 1 hour
      };
      
      // Create a simple JWT-like token
      const headerB64 = Buffer.from(JSON.stringify(header)).toString('base64url');
      const payloadB64 = Buffer.from(JSON.stringify(payload)).toString('base64url');
      const signature = 'mock-signature';
      
      const token = `${headerB64}.${payloadB64}.${signature}`;
      
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
      const parts = token.split('.')
      if (parts.length !== 3) {
        return res.status(401).json({ detail: 'Invalid token format' })
      }
      
      const payload = JSON.parse(Buffer.from(parts[1], 'base64url').toString())
      
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
  if ((pathname === '/api/courses/' || pathname === '/api/courses') && req.method === 'GET') {
    return res.status(200).json([
      {
        id: 1,
        title: "Plant Training & Testing",
        description: "CPCS and NPORS plant training and technical tests for excavator, roller, dumpers, dozer, telehandler and wheeled loading shovels.",
        category: "Plant Training",
        duration: "1-5 Days",
        price: "From £200",
        rating: 4.9,
        students_trained: 2500,
        duration_hours: 40,
        difficulty_level: "Intermediate",
        progress_percentage: 0,
        enrolled_at: new Date().toISOString(),
        status: "available",
        student_count: 15,
        content_count: 8,
        created_at: new Date().toISOString()
      },
      {
        id: 2,
        title: "Health & Safety Short Course",
        description: "Designed to keep people safe on site, covering topics including the people plant interface.",
        category: "Health & Safety",
        duration: "1 Day",
        price: "£150",
        rating: 4.8,
        students_trained: 3200,
        duration_hours: 8,
        difficulty_level: "Beginner",
        progress_percentage: 0,
        enrolled_at: new Date().toISOString(),
        status: "available",
        student_count: 12,
        content_count: 5,
        created_at: new Date().toISOString()
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

  // Mock course students endpoint
  if (pathname.startsWith('/api/courses/') && pathname.endsWith('/students') && req.method === 'GET') {
    const courseId = pathname.split('/')[3];
    return res.status(200).json({
      students: [
        {
          id: 1,
          email: 'student1@example.com',
          first_name: 'John',
          last_name: 'Doe',
          cscs_card_number: 'CSCS123456',
          is_active: true
        },
        {
          id: 2,
          email: 'student2@example.com',
          first_name: 'Jane',
          last_name: 'Smith',
          cscs_card_number: 'CSCS789012',
          is_active: true
        }
      ]
    })
  }

  // Mock user profiles
  if (pathname === '/api/user-profiles/me' && req.method === 'GET') {
    const authHeader = req.headers.authorization
    if (!authHeader) {
      return res.status(401).json({ detail: 'Not authenticated' })
    }
    
    try {
      const token = authHeader.replace('Bearer ', '')
      const parts = token.split('.')
      const payload = JSON.parse(Buffer.from(parts[1], 'base64url').toString())
      
      return res.status(200).json({
        id: 1,
        email: payload.sub,
        role: payload.role,
        first_name: 'Demo',
        last_name: 'User',
        phone: '+44 1234 567890',
        is_active: true,
        created_at: new Date().toISOString()
      })
    } catch (error) {
      return res.status(401).json({ detail: 'Invalid token' })
    }
  }

  // Mock messaging endpoints
  if (pathname === '/api/messaging/notifications' && req.method === 'GET') {
    return res.status(200).json([])
  }

  if (pathname === '/api/messaging/notifications/stream' && req.method === 'GET') {
    return res.status(200).json({ connected: true })
  }

  if (pathname === '/api/messaging/messages' && req.method === 'GET') {
    return res.status(200).json([])
  }

  if (pathname === '/api/messaging/dashboard/summary' && req.method === 'GET') {
    return res.status(200).json({
      total_messages: 0,
      unread_count: 0,
      recent_activity: []
    })
  }

  if (pathname === '/api/messaging/qa/posts' && req.method === 'GET') {
    return res.status(200).json([])
  }

  if (pathname === '/api/messaging/recipients' && req.method === 'GET') {
    return res.status(200).json([])
  }

  // Mock course requests
  if (pathname === '/api/course-requests/pending' && req.method === 'GET') {
    return res.status(200).json([])
  }

  // Mock course content endpoints
  if (pathname.startsWith('/api/courses/') && pathname.includes('/content') && req.method === 'GET') {
    return res.status(200).json([])
  }

  // Mock available students endpoint
  if (pathname.startsWith('/api/courses/') && pathname.endsWith('/available-students') && req.method === 'GET') {
    return res.status(200).json([])
  }

  // Mock course creation endpoint
  if (pathname === '/api/courses/' && req.method === 'POST') {
    return res.status(201).json({ id: Date.now(), message: 'Course created successfully' })
  }

  // Mock instructor AI upload endpoint
  if (pathname === '/api/instructor-ai/upload-document' && req.method === 'POST') {
    return res.status(200).json({ message: 'Document uploaded successfully' })
  }

  // Mock course access endpoints
  if (pathname.includes('/grant-access') && req.method === 'POST') {
    return res.status(200).json({ message: 'Access granted successfully' })
  }

  if (pathname.includes('/revoke-access') && req.method === 'POST') {
    return res.status(200).json({ message: 'Access revoked successfully' })
  }

  // Mock test creation endpoint
  if (pathname.includes('/create-test') && req.method === 'POST') {
    return res.status(200).json({ message: 'Test created successfully' })
  }

  // Mock content tweak endpoint
  if (pathname.includes('/tweak') && req.method === 'POST') {
    return res.status(200).json({ message: 'Content tweaked successfully' })
  }

  // Mock generated content endpoint
  if (pathname.includes('/generated-content') && req.method === 'GET') {
    return res.status(200).json({ content: 'Generated content here' })
  }

  // Mock course publish endpoint
  if (pathname.includes('/publish') && req.method === 'POST') {
    return res.status(200).json({ message: 'Course published successfully' })
  }

  // Mock notifications stream endpoint
  if (pathname === '/api/messaging/notifications/stream' && req.method === 'GET') {
    // Return proper EventStream response
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    return res.status(200).send('data: {"connected": true}\n\n');
  }

  // Default response
  res.status(404).json({ detail: 'Not found' })
}
