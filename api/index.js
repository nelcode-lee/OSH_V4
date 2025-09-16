// API with Neon DB integration
const dbService = require('./db-service');

// Add error handling for missing dependencies
try {
  const bcrypt = require('bcryptjs');
  console.log('✅ bcryptjs loaded successfully');
} catch (error) {
  console.error('❌ bcryptjs not available:', error.message);
}

// Initialize database connection
let dbInitialized = false;
dbService.initializeDatabase().then(initialized => {
  dbInitialized = initialized;
  console.log('Database initialized:', initialized);
}).catch(error => {
  console.error('Database initialization failed:', error.message);
  console.error('Database init error stack:', error.stack);
  dbInitialized = false;
});

export default async function handler(req, res) {
  try {
    // Get OpenAI API key from environment
    const openaiApiKey = process.env.OPENAI_API_KEY;
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
    console.log('API Request:', req.method, pathname);
  
  // Health check
  if (pathname === '/health' || pathname === '/api/health') {
    return res.status(200).json({ status: 'healthy', version: '1.0.0' })
  }

  // Authentication - try database first, fallback to mock
  if (pathname === '/api/auth/login' && req.method === 'POST') {
    try {
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
      
      let user = null;
      
      // Try database authentication first
      if (dbInitialized) {
        try {
          console.log('Attempting database authentication for:', username);
          user = await dbService.authenticateUser(username, password);
          console.log('Database authentication result:', user ? 'success' : 'failed');
        } catch (dbError) {
          console.error('Database authentication error:', dbError.message);
          console.error('Database error stack:', dbError.stack);
          // Fall through to mock authentication
        }
      } else {
        console.log('Database not initialized, using mock authentication');
      }
      
      // Fallback to mock authentication if database fails or not initialized
      if (!user) {
        const demoUsers = {
          'instructor@example.com': { role: 'instructor', password: 'password123' },
          'student@example.com': { role: 'student', password: 'password123' },
          'admin@example.com': { role: 'admin', password: 'password123' }
        }
        
        const demoUser = demoUsers[username];
        if (demoUser && demoUser.password === password) {
          user = {
            id: 1,
            email: username,
            role: demoUser.role,
            first_name: 'Demo',
            last_name: 'User'
          };
        }
      }
      
      if (user) {
        // Create JWT token
        const header = { alg: 'HS256', typ: 'JWT' };
        const payload = { 
          sub: user.email, 
          role: user.role,
          user_id: user.id,
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
          token_type: 'bearer',
          user: {
            id: user.id,
            email: user.email,
            role: user.role,
            first_name: user.first_name,
            last_name: user.last_name
          }
        });
      }
      
      return res.status(401).json({ detail: 'Incorrect email or password' });
    } catch (error) {
      console.error('Login error:', error);
      return res.status(500).json({ detail: 'Internal server error' });
    }
  }

  // User profile - try database first, fallback to mock
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
      
      // Try to get user from database
      if (dbInitialized && payload.user_id) {
        try {
          const user = await dbService.getUserByEmail(payload.sub);
          if (user) {
            const { password_hash, ...userWithoutPassword } = user;
            return res.status(200).json(userWithoutPassword);
          }
        } catch (dbError) {
          console.error('Database user lookup error:', dbError);
          // Fall through to mock response
        }
      }
      
      // Fallback to mock response
      return res.status(200).json({
        id: payload.user_id || 1,
        email: payload.sub,
        role: payload.role,
        first_name: 'Demo',
        last_name: 'User',
        is_active: true,
        created_at: new Date().toISOString()
      });
    } catch (error) {
      return res.status(401).json({ detail: 'Invalid token' })
    }
  }

  // User registration
  if (pathname === '/api/auth/register' && req.method === 'POST') {
    try {
      const { email, password, first_name, last_name, role = 'student', phone } = req.body;
      
      if (!email || !password) {
        return res.status(400).json({ detail: 'Email and password are required' });
      }
      
      if (dbInitialized) {
        try {
          const user = await dbService.createUser({
            email,
            password,
            first_name,
            last_name,
            role,
            phone
          });
          
          return res.status(201).json({
            message: 'User created successfully',
            user: {
              id: user.id,
              email: user.email,
              first_name: user.first_name,
              last_name: user.last_name,
              role: user.role,
              created_at: user.created_at
            }
          });
        } catch (dbError) {
          if (dbError.code === '23505') { // Unique constraint violation
            return res.status(409).json({ detail: 'User with this email already exists' });
          }
          console.error('Database registration error:', dbError);
          return res.status(500).json({ detail: 'Failed to create user' });
        }
      } else {
        return res.status(503).json({ detail: 'Database not available' });
      }
    } catch (error) {
      console.error('Registration error:', error);
      return res.status(500).json({ detail: 'Internal server error' });
    }
  }

    // Courses data - try database first, fallback to mock
    if ((pathname === '/api/courses/' || pathname === '/api/courses') && req.method === 'GET') {
      try {
        if (dbInitialized) {
          const courses = await dbService.getCourses();
          return res.status(200).json(courses);
        } else {
          // Fallback to mock data
          return res.status(200).json([
            {
              id: 1,
              title: "Plant Training & Testing",
              description: "CPCS and NPORS plant training and technical tests for excavator, roller, dumpers, dozer, telehandler and wheeled loading shovels.",
              category: "Plant Training",
              duration: "1-5 Days",
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
          ]);
        }
      } catch (error) {
        console.error('Error fetching courses:', error);
        return res.status(500).json({ error: 'Failed to fetch courses' });
      }
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

  // AI Content Generation Endpoints
  if (pathname === '/api/ai/generate-content' && req.method === 'POST') {
    try {
      const { content_type, title, description, additional_instructions, difficulty_level, target_audience, use_rag } = req.body;
      
      // Mock AI content generation with RAG support
      const mockContent = generateMockAIContent({
        content_type,
        title,
        description,
        additional_instructions,
        difficulty_level,
        target_audience,
        use_rag: use_rag || false
      });
      
      return res.status(200).json({
        success: true,
        content: mockContent,
        rag_enabled: use_rag || false,
        sources_used: use_rag ? 3 : 0
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        error: 'Content generation failed'
      });
    }
  }

  if (pathname === '/api/ai/generate-test' && req.method === 'POST') {
    try {
      const { content, question_count, question_types, difficulty_level, passing_score } = req.body;
      
      // Mock AI test generation
      const mockTest = generateMockAITest({
        content,
        question_count,
        question_types,
        difficulty_level,
        passing_score
      });
      
      return res.status(200).json({
        success: true,
        test: mockTest
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        error: 'Test generation failed'
      });
    }
  }

  if (pathname === '/api/ai/instructor-workflow' && req.method === 'POST') {
    try {
      const { action, course_id, content_id, data } = req.body;
      
      // Mock AI workflow response
      const mockResult = generateMockAIWorkflow(action, data);
      
      return res.status(200).json({
        success: true,
        result: mockResult
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        error: 'AI workflow failed'
      });
    }
  }

  // Default response
  res.status(404).json({ detail: 'Not found' })
  
  } catch (error) {
    console.error('API Handler Error:', error.message);
    console.error('API Error Stack:', error.stack);
    res.status(500).json({ 
      detail: 'Internal server error',
      error: error.message 
    });
  }
}

// Helper functions for AI content generation
function generateMockAIContent(request) {
  const ragContext = request.use_rag ? `

## Context from Uploaded Documents
Based on analysis of existing course materials and industry documentation:

### Source Document 1: "CPCS Training Manual - ${request.title}"
- Key safety procedures and protocols
- Equipment specifications and requirements
- Assessment criteria and competency standards

### Source Document 2: "Industry Best Practices Guide"
- Current regulations and compliance requirements
- Common challenges and solutions
- Performance benchmarks and standards

### Source Document 3: "Technical Specifications"
- Detailed technical requirements
- Maintenance and inspection procedures
- Quality control measures

` : '';

  const contentTemplates = {
    learning_material: `# ${request.title}

## Overview
${request.description}${ragContext}

## Learning Objectives
By the end of this module, you will be able to:
- Understand the fundamental principles of ${request.title}
- Apply safety protocols and best practices
- Demonstrate competency in practical applications
- Identify potential hazards and mitigation strategies
- Follow industry standards and regulations

## Key Learning Points

### 1. Safety and Compliance
- **Personal Protective Equipment (PPE)**: Always wear appropriate safety gear
- **Risk Assessment**: Identify and evaluate potential hazards before starting work
- **Emergency Procedures**: Know how to respond to accidents and emergencies
- **Regulatory Compliance**: Follow all relevant health and safety regulations

### 2. Technical Knowledge
- **Equipment Operation**: Understanding proper use and maintenance of tools and machinery
- **Quality Standards**: Maintaining high standards in all operations
- **Documentation**: Keeping accurate records and reports
- **Problem Solving**: Identifying and resolving issues effectively

### 3. Practical Application
- **Hands-on Experience**: Applying knowledge in real-world scenarios
- **Team Coordination**: Working effectively with colleagues and supervisors
- **Continuous Improvement**: Seeking ways to enhance performance and safety
- **Professional Development**: Staying updated with industry best practices

## Detailed Content

### Section 1: Fundamentals of ${request.title}
Understanding the core concepts and principles is essential for success. This section covers:
- Basic terminology and definitions
- Industry standards and regulations
- Safety requirements and protocols
- Equipment specifications and capabilities

### Section 2: Practical Implementation
Learn how to apply your knowledge in real-world situations:
- Step-by-step procedures and workflows
- Common challenges and solutions
- Quality control measures
- Performance monitoring and evaluation

### Section 3: Safety and Risk Management
Critical safety considerations for ${request.title}:
- Hazard identification and assessment
- Risk mitigation strategies
- Emergency response procedures
- Incident reporting and investigation

## Assessment and Evaluation
- **Knowledge Tests**: Written assessments to verify understanding
- **Practical Demonstrations**: Hands-on competency evaluations
- **Continuous Monitoring**: Ongoing performance assessment
- **Certification Requirements**: Meeting industry standards for qualification

## Summary
This comprehensive learning material provides the foundation for understanding ${request.title} in the construction industry. The content emphasizes safety, quality, and compliance while preparing you for practical application in your work environment.

${request.use_rag ? '*This content was generated using RAG (Retrieval-Augmented Generation) based on uploaded course documents and industry materials.*' : ''}`,

    lesson_plan: `# Lesson Plan: ${request.title}

## Learning Objectives
By the end of this lesson, students will be able to:
- Understand the fundamental principles of ${request.title}
- Apply safety protocols and industry best practices
- Demonstrate competency through practical assessments
- Identify potential hazards and mitigation strategies
- Follow proper procedures and quality standards${ragContext}

## Duration
2 hours (120 minutes)

## Target Audience
Construction industry professionals, safety personnel, and equipment operators

## Prerequisites
- Basic construction industry knowledge
- Valid CSCS card (where applicable)
- Completion of health and safety awareness training

## Materials Needed
- Course materials and handouts
- Personal Protective Equipment (PPE)
- Practical demonstration equipment
- Assessment tools and checklists
- Visual aids and diagrams
- Safety data sheets and manuals
${request.use_rag ? '- Reference documents and source materials' : ''}

## Lesson Structure

### Introduction (20 minutes)
- Welcome and introductions
- Learning objectives overview
- Pre-assessment quiz
- Safety briefing and PPE requirements
- Course outline and expectations

### Main Content (80 minutes)

#### Part 1: Theory and Fundamentals (30 minutes)
- Core concepts and principles of ${request.title}
- Industry standards and regulations
- Safety requirements and protocols
- Equipment specifications and capabilities

#### Part 2: Practical Demonstration (30 minutes)
- Step-by-step procedure demonstration
- Safety considerations and risk assessment
- Common challenges and solutions
- Quality control measures

#### Part 3: Hands-on Practice (20 minutes)
- Supervised practical exercises
- Individual competency assessment
- Peer observation and feedback
- Problem-solving scenarios

### Conclusion (20 minutes)
- Key points summary and review
- Q&A session and clarification
- Assessment completion
- Next steps and additional resources
- Course evaluation and feedback

## Assessment Methods
- **Written Assessment**: 20-question multiple choice test
- **Practical Demonstration**: Hands-on competency evaluation
- **Peer Review**: Collaborative assessment activities
- **Continuous Monitoring**: Ongoing performance observation

## Safety Considerations
- All participants must wear appropriate PPE
- Emergency procedures and evacuation routes
- First aid and emergency contact information
- Incident reporting procedures

## Resources and References
- Industry safety standards and regulations
- Equipment manuals and specifications
- Best practice guidelines
- Additional learning materials

${request.use_rag ? '*This lesson plan was generated using RAG based on uploaded course documents and industry standards.*' : ''}`,

    test: `# Assessment: ${request.title}

## Instructions
This assessment evaluates your understanding of ${request.title}. Read each question carefully and select the best answer.${ragContext}

## Question 1 (Multiple Choice)
What is the primary purpose of ${request.title}?
A) To increase production speed
B) To ensure safety and compliance with industry standards
C) To reduce operational costs
D) To improve team coordination

**Correct Answer: B) To ensure safety and compliance with industry standards**

## Question 2 (Multiple Choice)
Which of the following is most critical when performing ${request.title}?
A) Working as quickly as possible
B) Following established safety protocols
C) Minimizing equipment usage
D) Reducing documentation time

**Correct Answer: B) Following established safety protocols**

## Question 3 (True/False)
Proper training and certification are required before performing ${request.title}.
- True
- False

**Correct Answer: True**

## Question 4 (Multiple Choice)
What should you do if you encounter an unsafe condition during ${request.title}?
A) Continue working to meet deadlines
B) Report the condition immediately and stop work
C) Try to fix it yourself
D) Ignore it if it seems minor

**Correct Answer: B) Report the condition immediately and stop work**

## Question 5 (Short Answer)
Explain the importance of regular maintenance and inspection in ${request.title}.

**Sample Answer**: Regular maintenance and inspection ensure equipment reliability, prevent accidents, maintain compliance with regulations, and extend equipment lifespan while protecting worker safety.

${request.use_rag ? '*This assessment was generated using RAG based on uploaded course documents and industry standards.*' : ''}`,

    assessment: `# Assessment Rubric: ${request.title}

## Performance Criteria

### Excellent (90-100%)
- Demonstrates complete understanding
- Applies concepts correctly
- Shows initiative and creativity
- Exceeds expectations

### Good (80-89%)
- Shows solid understanding
- Applies most concepts correctly
- Meets expectations consistently
- Minor areas for improvement

### Satisfactory (70-79%)
- Basic understanding demonstrated
- Some concepts applied correctly
- Meets minimum requirements
- Several areas need improvement

### Needs Improvement (Below 70%)
- Limited understanding shown
- Concepts not applied correctly
- Below minimum requirements
- Significant improvement needed

## Assessment Methods
- Written examination (40%)
- Practical demonstration (40%)
- Participation and engagement (20%)`
  };

  const content = contentTemplates[request.content_type] || contentTemplates.learning_material;
  
  return {
    title: request.title,
    content,
    type: request.content_type,
    metadata: {
      word_count: content.split(' ').length,
      estimated_read_time: Math.ceil(content.split(' ').length / 200),
      difficulty_level: request.difficulty_level || 'intermediate',
      topics: ['Safety', 'Procedures', 'Quality Control', 'Best Practices']
    }
  };
}

function generateMockAITest(request) {
  const questions = [
    {
      id: '1',
      question: 'What is the primary focus of this content?',
      type: 'multiple_choice',
      options: ['Speed', 'Safety', 'Cost', 'Efficiency'],
      correct_answer: 1,
      explanation: 'Safety is the primary focus as it ensures proper procedures and prevents accidents.',
      points: 10
    },
    {
      id: '2',
      question: 'Following established procedures is always mandatory.',
      type: 'true_false',
      correct_answer: true,
      explanation: 'Established procedures are designed to ensure safety and quality, so they must always be followed.',
      points: 10
    },
    {
      id: '3',
      question: 'Explain the importance of quality control in this context.',
      type: 'short_answer',
      correct_answer: 'Quality control ensures consistent results and maintains high standards.',
      explanation: 'Quality control is essential for maintaining standards and preventing errors.',
      points: 15
    }
  ];

  return {
    title: `Knowledge Test - ${request.question_count} Questions`,
    questions: questions.slice(0, request.question_count),
    total_points: questions.slice(0, request.question_count).reduce((sum, q) => sum + q.points, 0),
    passing_score: request.passing_score || 70,
    estimated_duration: request.question_count * 2
  };
}

function generateMockAIWorkflow(action, data) {
  switch (action) {
    case 'analyze_content':
      return {
        reading_level: 'Intermediate',
        key_concepts: ['Safety Procedures', 'Equipment Operation', 'Quality Control'],
        suggested_questions: [
          'What are the key safety procedures mentioned?',
          'How should equipment be operated safely?',
          'What quality control measures are important?'
        ],
        learning_objectives: [
          'Understand safety protocols',
          'Learn proper equipment operation',
          'Apply quality control standards'
        ]
      };
    case 'generate_questions':
      return {
        questions: [
          'What are the main safety considerations?',
          'How do you ensure quality control?',
          'What are the key procedures to follow?'
        ]
      };
    case 'suggest_improvements':
      return {
        suggestions: [
          'Add more practical examples',
          'Include visual aids',
          'Provide step-by-step instructions'
        ]
      };
    default:
      return { message: 'AI workflow completed successfully' };
  }
}
