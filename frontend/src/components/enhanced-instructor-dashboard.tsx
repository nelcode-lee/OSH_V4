"use client";

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import EnhancedStudentManagement from './enhanced-student-management';
import EnhancedAnalyticsDashboard from './enhanced-analytics-dashboard';
import { 
  BookOpen, 
  Users, 
  Upload, 
  BarChart3, 
  Plus,
  Eye,
  Edit,
  Trash2,
  UserPlus,
  UserMinus,
  TestTube,
  Settings,
  MessageSquare,
  Clock,
  TrendingUp,
  AlertCircle,
  CheckCircle,
  Star,
  Calendar,
  FileText,
  Video,
  Image,
  Download,
  Share2,
  Filter,
  Search,
  MoreVertical,
  ArrowRight,
  Activity,
  Target,
  Zap,
  Award,
  Bookmark,
  Bell,
  ChevronRight,
  ChevronDown,
  Play,
  Pause,
  RefreshCw,
  Home,
  BookmarkCheck,
  BarChart
} from 'lucide-react';

interface Course {
  id: number;
  title: string;
  description: string;
  student_count?: number;
  content_count?: number;
  created_at: string;
  status?: 'draft' | 'published' | 'archived';
  progress?: number;
  last_activity?: string;
  category?: string;
  difficulty?: 'beginner' | 'intermediate' | 'advanced';
}

interface Student {
  id: number;
  email: string;
  first_name: string;
  last_name: string;
  cscs_card_number: string | null;
  is_active: boolean;
  progress?: number;
  last_login?: string;
  enrolled_date?: string;
}

interface QuickStats {
  totalCourses: number;
  totalStudents: number;
  totalContent: number;
  activeSessions: number;
  completionRate: number;
  avgRating: number;
}

interface RecentActivity {
  id: number;
  type: 'enrollment' | 'completion' | 'upload' | 'test' | 'message';
  title: string;
  description: string;
  timestamp: string;
  user?: string;
  course?: string;
}

export default function EnhancedInstructorDashboard() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([]);
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [showQuickActions, setShowQuickActions] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');

  // Mock data - replace with real API calls
  useEffect(() => {
    // Mock courses data
    setCourses([
      {
        id: 1,
        title: "Plant Training & Testing",
        description: "CPCS and NPORS plant training and technical tests for excavator, roller, dumpers, dozer, telehandler and wheeled loading shovels.",
        student_count: 15,
        content_count: 8,
        created_at: "2024-01-15T10:00:00Z",
        status: 'published',
        progress: 85,
        last_activity: "2 hours ago",
        category: "Plant Training",
        difficulty: "intermediate"
      },
      {
        id: 2,
        title: "Health & Safety Short Course",
        description: "Designed to keep people safe on site, covering topics including the people plant interface.",
        student_count: 12,
        content_count: 5,
        created_at: "2024-01-10T14:30:00Z",
        status: 'published',
        progress: 92,
        last_activity: "1 hour ago",
        category: "Health & Safety",
        difficulty: "beginner"
      },
      {
        id: 3,
        title: "GPS Training Advanced",
        description: "Advanced GPS machine control and guidance training using simulation and practical exercises.",
        student_count: 8,
        content_count: 12,
        created_at: "2024-01-05T09:15:00Z",
        status: 'draft',
        progress: 45,
        last_activity: "3 days ago",
        category: "GPS Training",
        difficulty: "advanced"
      }
    ]);

    // Mock students data
    setStudents([
      {
        id: 1,
        email: "john.doe@example.com",
        first_name: "John",
        last_name: "Doe",
        cscs_card_number: "CSCS123456",
        is_active: true,
        progress: 75,
        last_login: "2 hours ago",
        enrolled_date: "2024-01-15"
      },
      {
        id: 2,
        email: "jane.smith@example.com",
        first_name: "Jane",
        last_name: "Smith",
        cscs_card_number: "CSCS789012",
        is_active: true,
        progress: 90,
        last_login: "1 hour ago",
        enrolled_date: "2024-01-10"
      }
    ]);

    // Mock recent activity
    setRecentActivity([
      {
        id: 1,
        type: 'enrollment',
        title: 'New Student Enrollment',
        description: 'John Doe enrolled in Plant Training & Testing',
        timestamp: '2 hours ago',
        user: 'John Doe',
        course: 'Plant Training & Testing'
      },
      {
        id: 2,
        type: 'completion',
        title: 'Course Completed',
        description: 'Jane Smith completed Health & Safety Short Course',
        timestamp: '4 hours ago',
        user: 'Jane Smith',
        course: 'Health & Safety Short Course'
      },
      {
        id: 3,
        type: 'upload',
        title: 'Content Uploaded',
        description: 'New PDF uploaded to GPS Training Advanced',
        timestamp: '1 day ago',
        course: 'GPS Training Advanced'
      }
    ]);
  }, []);

  const quickStats: QuickStats = {
    totalCourses: courses.length,
    totalStudents: students.length,
    totalContent: courses.reduce((sum, course) => sum + (course.content_count || 0), 0),
    activeSessions: 24,
    completionRate: 87,
    avgRating: 4.8
  };

  const filteredCourses = courses.filter(course => {
    const matchesSearch = course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         course.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterStatus === 'all' || course.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'published': return 'bg-green-100 text-green-800';
      case 'draft': return 'bg-yellow-100 text-yellow-800';
      case 'archived': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner': return 'bg-blue-100 text-blue-800';
      case 'intermediate': return 'bg-orange-100 text-orange-800';
      case 'advanced': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'enrollment': return <UserPlus className="h-4 w-4 text-green-600" />;
      case 'completion': return <CheckCircle className="h-4 w-4 text-blue-600" />;
      case 'upload': return <Upload className="h-4 w-4 text-purple-600" />;
      case 'test': return <TestTube className="h-4 w-4 text-orange-600" />;
      case 'message': return <MessageSquare className="h-4 w-4 text-indigo-600" />;
      default: return <Activity className="h-4 w-4 text-gray-600" />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Enhanced Header */}
      <div className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="p-2 bg-blue-100 rounded-lg">
                <BookOpen className="h-8 w-8 text-blue-600" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Instructor Dashboard</h1>
                <p className="text-gray-600">Manage courses, students, and content efficiently</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Button variant="outline" size="sm">
                <Bell className="h-4 w-4 mr-2" />
                Notifications
              </Button>
              <Button variant="outline" size="sm">
                <Settings className="h-4 w-4 mr-2" />
                Settings
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Main Content with Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview" className="flex items-center space-x-2">
              <Home className="h-4 w-4" />
              <span>Overview</span>
            </TabsTrigger>
            <TabsTrigger value="courses" className="flex items-center space-x-2">
              <BookOpen className="h-4 w-4" />
              <span>Courses</span>
            </TabsTrigger>
            <TabsTrigger value="students" className="flex items-center space-x-2">
              <Users className="h-4 w-4" />
              <span>Students</span>
            </TabsTrigger>
            <TabsTrigger value="analytics" className="flex items-center space-x-2">
              <BarChart className="h-4 w-4" />
              <span>Analytics</span>
            </TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            {/* Enhanced Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="hover:shadow-lg transition-shadow duration-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Courses</p>
                  <p className="text-3xl font-bold text-gray-900">{quickStats.totalCourses}</p>
                  <p className="text-xs text-green-600 flex items-center mt-1">
                    <TrendingUp className="h-3 w-3 mr-1" />
                    +2 this month
                  </p>
                </div>
                <div className="p-3 bg-blue-100 rounded-full">
                  <BookOpen className="h-6 w-6 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow duration-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Active Students</p>
                  <p className="text-3xl font-bold text-gray-900">{quickStats.totalStudents}</p>
                  <p className="text-xs text-green-600 flex items-center mt-1">
                    <TrendingUp className="h-3 w-3 mr-1" />
                    +5 this week
                  </p>
                </div>
                <div className="p-3 bg-green-100 rounded-full">
                  <Users className="h-6 w-6 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow duration-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Completion Rate</p>
                  <p className="text-3xl font-bold text-gray-900">{quickStats.completionRate}%</p>
                  <div className="mt-2">
                    <Progress value={quickStats.completionRate} className="h-2" />
                  </div>
                </div>
                <div className="p-3 bg-purple-100 rounded-full">
                  <Target className="h-6 w-6 text-purple-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow duration-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Average Rating</p>
                  <p className="text-3xl font-bold text-gray-900">{quickStats.avgRating}</p>
                  <div className="flex items-center mt-1">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className={`h-3 w-3 ${i < Math.floor(quickStats.avgRating) ? 'text-yellow-400 fill-current' : 'text-gray-300'}`} />
                    ))}
                  </div>
                </div>
                <div className="p-3 bg-yellow-100 rounded-full">
                  <Award className="h-6 w-6 text-yellow-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions Panel */}
        <Card className="mb-8">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center">
                <Zap className="h-5 w-5 mr-2 text-yellow-500" />
                Quick Actions
              </CardTitle>
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => setShowQuickActions(!showQuickActions)}
              >
                {showQuickActions ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
              </Button>
            </div>
          </CardHeader>
          {showQuickActions && (
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                <Button className="h-20 flex-col space-y-2" variant="outline">
                  <Upload className="h-6 w-6" />
                  <span className="text-xs">Upload PDF</span>
                </Button>
                <Button className="h-20 flex-col space-y-2" variant="outline">
                  <Plus className="h-6 w-6" />
                  <span className="text-xs">New Course</span>
                </Button>
                <Button className="h-20 flex-col space-y-2" variant="outline">
                  <TestTube className="h-6 w-6" />
                  <span className="text-xs">Create Test</span>
                </Button>
                <Button className="h-20 flex-col space-y-2" variant="outline">
                  <BarChart3 className="h-6 w-6" />
                  <span className="text-xs">Analytics</span>
                </Button>
                <Button className="h-20 flex-col space-y-2" variant="outline">
                  <MessageSquare className="h-6 w-6" />
                  <span className="text-xs">Messages</span>
                </Button>
                <Button className="h-20 flex-col space-y-2" variant="outline">
                  <Settings className="h-6 w-6" />
                  <span className="text-xs">Settings</span>
                </Button>
              </div>
            </CardContent>
          )}
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Courses Section */}
          <div className="lg:col-span-2">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Your Courses</h2>
              <div className="flex items-center space-x-4">
                <div className="relative">
                  <Search className="h-4 w-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search courses..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="all">All Status</option>
                  <option value="published">Published</option>
                  <option value="draft">Draft</option>
                  <option value="archived">Archived</option>
                </select>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}
                >
                  {viewMode === 'grid' ? 'List View' : 'Grid View'}
                </Button>
              </div>
            </div>

            <div className={`grid gap-6 ${viewMode === 'grid' ? 'grid-cols-1 md:grid-cols-2' : 'grid-cols-1'}`}>
              {filteredCourses.map((course) => (
                <Card 
                  key={course.id} 
                  className={`hover:shadow-lg transition-all duration-200 cursor-pointer ${
                    selectedCourse?.id === course.id 
                      ? 'ring-2 ring-blue-500 shadow-lg border-blue-300' 
                      : 'hover:shadow-lg'
                  }`}
                  onClick={() => setSelectedCourse(course)}
                >
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <CardTitle className="text-lg font-semibold text-gray-900 mb-2">
                          {course.title}
                        </CardTitle>
                        <div className="flex items-center space-x-2 mb-2">
                          <Badge className={getStatusColor(course.status || 'draft')}>
                            {course.status || 'draft'}
                          </Badge>
                          <Badge className={getDifficultyColor(course.difficulty || 'beginner')}>
                            {course.difficulty || 'beginner'}
                          </Badge>
                          <Badge variant="outline">
                            {course.category}
                          </Badge>
                        </div>
                      </div>
                      <Button variant="ghost" size="sm">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                      {course.description}
                    </p>
                    
                    <div className="space-y-3">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-500">Progress</span>
                        <span className="font-medium">{course.progress || 0}%</span>
                      </div>
                      <Progress value={course.progress || 0} className="h-2" />
                      
                      <div className="flex items-center justify-between text-sm text-gray-500">
                        <div className="flex items-center space-x-4">
                          <span className="flex items-center">
                            <Users className="h-4 w-4 mr-1" />
                            {course.student_count || 0} students
                          </span>
                          <span className="flex items-center">
                            <FileText className="h-4 w-4 mr-1" />
                            {course.content_count || 0} items
                          </span>
                        </div>
                        <span className="flex items-center">
                          <Clock className="h-4 w-4 mr-1" />
                          {course.last_activity}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-100">
                      <Button size="sm" variant="outline">
                        <Eye className="h-4 w-4 mr-2" />
                        View
                      </Button>
                      <Button size="sm" variant="outline">
                        <Edit className="h-4 w-4 mr-2" />
                        Edit
                      </Button>
                      <Button size="sm" className="bg-blue-600 hover:bg-blue-700">
                        <Users className="h-4 w-4 mr-2" />
                        Manage
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Recent Activity */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Activity className="h-5 w-5 mr-2 text-green-500" />
                  Recent Activity
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recentActivity.map((activity) => (
                    <div key={activity.id} className="flex items-start space-x-3">
                      <div className="flex-shrink-0 mt-1">
                        {getActivityIcon(activity.type)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900">
                          {activity.title}
                        </p>
                        <p className="text-sm text-gray-500">
                          {activity.description}
                        </p>
                        <p className="text-xs text-gray-400 mt-1">
                          {activity.timestamp}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
                <Button variant="ghost" className="w-full mt-4">
                  View All Activity
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </CardContent>
            </Card>

            {/* Top Students */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Award className="h-5 w-5 mr-2 text-yellow-500" />
                  Top Students
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {students.map((student, index) => (
                    <div key={student.id} className="flex items-center space-x-3">
                      <div className="flex-shrink-0">
                        <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                          <span className="text-sm font-medium text-blue-600">
                            {student.first_name.charAt(0)}
                          </span>
                        </div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900">
                          {student.first_name} {student.last_name}
                        </p>
                        <p className="text-sm text-gray-500">
                          {student.progress || 0}% complete
                        </p>
                        <Progress value={student.progress || 0} className="h-1 mt-1" />
                      </div>
                      <div className="flex-shrink-0">
                        <span className="text-xs text-gray-400">
                          #{index + 1}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
                <Button variant="ghost" className="w-full mt-4">
                  View All Students
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </CardContent>
            </Card>

            {/* Quick Stats */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <BarChart3 className="h-5 w-5 mr-2 text-purple-500" />
                  This Week
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">New Enrollments</span>
                    <span className="text-sm font-medium text-green-600">+12</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Course Completions</span>
                    <span className="text-sm font-medium text-blue-600">+8</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Content Uploads</span>
                    <span className="text-sm font-medium text-purple-600">+5</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Test Submissions</span>
                    <span className="text-sm font-medium text-orange-600">+23</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
            </div>
          </TabsContent>

          {/* Courses Tab */}
          <TabsContent value="courses" className="space-y-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Course Management</h2>
              <div className="flex items-center space-x-4">
                <div className="relative">
                  <Search className="h-4 w-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search courses..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="all">All Status</option>
                  <option value="published">Published</option>
                  <option value="draft">Draft</option>
                  <option value="archived">Archived</option>
                </select>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}
                >
                  {viewMode === 'grid' ? 'List View' : 'Grid View'}
                </Button>
              </div>
            </div>

            <div className={`grid gap-6 ${viewMode === 'grid' ? 'grid-cols-1 md:grid-cols-2' : 'grid-cols-1'}`}>
              {filteredCourses.map((course) => (
                <Card 
                  key={course.id} 
                  className={`hover:shadow-lg transition-all duration-200 cursor-pointer ${
                    selectedCourse?.id === course.id 
                      ? 'ring-2 ring-blue-500 shadow-lg border-blue-300' 
                      : 'hover:shadow-lg'
                  }`}
                  onClick={() => setSelectedCourse(course)}
                >
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <CardTitle className="text-lg font-semibold text-gray-900 mb-2">
                          {course.title}
                        </CardTitle>
                        <div className="flex items-center space-x-2 mb-2">
                          <Badge className={getStatusColor(course.status || 'draft')}>
                            {course.status || 'draft'}
                          </Badge>
                          <Badge className={getDifficultyColor(course.difficulty || 'beginner')}>
                            {course.difficulty || 'beginner'}
                          </Badge>
                          <Badge variant="outline">
                            {course.category}
                          </Badge>
                        </div>
                      </div>
                      <Button variant="ghost" size="sm">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                      {course.description}
                    </p>
                    
                    <div className="space-y-3">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-500">Progress</span>
                        <span className="font-medium">{course.progress || 0}%</span>
                      </div>
                      <Progress value={course.progress || 0} className="h-2" />
                      
                      <div className="flex items-center justify-between text-sm text-gray-500">
                        <div className="flex items-center space-x-4">
                          <span className="flex items-center">
                            <Users className="h-4 w-4 mr-1" />
                            {course.student_count || 0} students
                          </span>
                          <span className="flex items-center">
                            <FileText className="h-4 w-4 mr-1" />
                            {course.content_count || 0} items
                          </span>
                        </div>
                        <span className="flex items-center">
                          <Clock className="h-4 w-4 mr-1" />
                          {course.last_activity}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-100">
                      <Button size="sm" variant="outline">
                        <Eye className="h-4 w-4 mr-2" />
                        View
                      </Button>
                      <Button size="sm" variant="outline">
                        <Edit className="h-4 w-4 mr-2" />
                        Edit
                      </Button>
                      <Button size="sm" className="bg-blue-600 hover:bg-blue-700">
                        <Users className="h-4 w-4 mr-2" />
                        Manage
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Students Tab */}
          <TabsContent value="students">
            <EnhancedStudentManagement />
          </TabsContent>

          {/* Analytics Tab */}
          <TabsContent value="analytics">
            <EnhancedAnalyticsDashboard />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
