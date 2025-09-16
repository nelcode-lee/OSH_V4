// Simple API for demo purposes
export default function handler(req, res) {
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

## Key Learning Points
- **Safety First**: Always follow established safety protocols
- **Proper Procedures**: Use correct techniques and methods
- **Quality Standards**: Maintain high quality in all operations
- **Continuous Improvement**: Seek ways to enhance performance

## Detailed Content
This comprehensive learning material covers essential aspects of ${request.title.toLowerCase()}. Students will gain practical knowledge and skills that can be immediately applied in real-world scenarios.

### Section 1: Fundamentals
Understanding the basic principles and concepts is crucial for success in this area.

### Section 2: Practical Application
Hands-on experience and real-world examples help solidify learning.

### Section 3: Best Practices
Industry best practices and proven methodologies for optimal results.

## Summary
This material provides a solid foundation for understanding ${request.title.toLowerCase()} and prepares students for practical application in their work environment.

${request.use_rag ? '*This content was generated using RAG (Retrieval-Augmented Generation) based on uploaded course documents and industry materials.*' : ''}`,

    lesson_plan: `# Lesson Plan: ${request.title}

## Learning Objectives
By the end of this lesson, students will be able to:
- Understand the core concepts of ${request.title.toLowerCase()}
- Apply practical skills in real-world scenarios
- Demonstrate competency through assessments${ragContext}

## Duration
90 minutes

## Materials Needed
- Course materials and handouts
- Practical demonstration equipment
- Assessment tools
${request.use_rag ? '- Reference documents and source materials' : ''}

## Lesson Structure

### Introduction (15 minutes)
- Welcome and overview
- Learning objectives
- Pre-assessment

### Main Content (60 minutes)
- Core concepts presentation
- Interactive demonstrations
- Hands-on practice
- Group discussions

### Conclusion (15 minutes)
- Key points summary
- Q&A session
- Next steps and assignments

## Assessment
- Practical demonstration
- Knowledge check
- Peer evaluation

${request.use_rag ? '*This lesson plan was generated using RAG based on uploaded course documents.*' : ''}`,

    test: `# Assessment: ${request.title}

## Instructions
This assessment evaluates your understanding of ${request.title.toLowerCase()}. Read each question carefully and select the best answer.

## Question 1 (Multiple Choice)
What is the most important aspect of ${request.title.toLowerCase()}?
A) Speed
B) Safety
C) Cost
D) Efficiency

**Correct Answer: B) Safety**

## Question 2 (True/False)
Following established procedures is optional in ${request.title.toLowerCase()}.
- True
- False

**Correct Answer: False**

## Question 3 (Short Answer)
Explain why quality control is important in ${request.title.toLowerCase()}.

**Sample Answer**: Quality control ensures consistent results, reduces errors, and maintains high standards.`,

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
