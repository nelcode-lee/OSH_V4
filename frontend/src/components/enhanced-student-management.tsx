"use client";

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Input } from '@/components/ui/input';
import { 
  Users, 
  Search, 
  Filter, 
  UserPlus, 
  UserMinus, 
  Mail, 
  Phone, 
  Calendar,
  Award,
  Clock,
  CheckCircle,
  AlertCircle,
  MoreVertical,
  Eye,
  Edit,
  Trash2,
  Download,
  Upload,
  MessageSquare,
  BarChart3,
  TrendingUp,
  Star,
  BookOpen,
  Target,
  Zap
} from 'lucide-react';

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
  completion_rate?: number;
  courses_enrolled?: number;
  certificates_earned?: number;
  avg_score?: number;
  last_activity?: string;
  status?: 'active' | 'inactive' | 'suspended';
  role?: string;
  company?: string;
}

interface Course {
  id: number;
  title: string;
  progress: number;
  status: 'enrolled' | 'in_progress' | 'completed' | 'failed';
  enrolled_date: string;
  completion_date?: string;
  score?: number;
}

export default function EnhancedStudentManagement() {
  const [students, setStudents] = useState<Student[]>([]);
  const [filteredStudents, setFilteredStudents] = useState<Student[]>([]);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [studentCourses, setStudentCourses] = useState<Course[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('name');
  const [viewMode, setViewMode] = useState<'grid' | 'list' | 'table'>('grid');
  const [showBulkActions, setShowBulkActions] = useState(false);
  const [selectedStudents, setSelectedStudents] = useState<number[]>([]);

  // Mock data - replace with real API calls
  useEffect(() => {
    const mockStudents: Student[] = [
      {
        id: 1,
        email: "ahmed.hassan@example.com",
        first_name: "Ahmed",
        last_name: "Hassan",
        cscs_card_number: "CSCS123456",
        is_active: true,
        progress: 75,
        last_login: "2 hours ago",
        enrolled_date: "2024-01-15",
        completion_rate: 85,
        courses_enrolled: 3,
        certificates_earned: 2,
        avg_score: 87,
        last_activity: "Completed Plant Training quiz",
        status: 'active',
        role: "Plant Operative",
        company: "Balfour Beatty"
      },
      {
        id: 2,
        email: "priya.patel@example.com",
        first_name: "Priya",
        last_name: "Patel",
        cscs_card_number: "CSCS789012",
        is_active: true,
        progress: 90,
        last_login: "1 hour ago",
        enrolled_date: "2024-01-10",
        completion_rate: 92,
        courses_enrolled: 2,
        certificates_earned: 1,
        avg_score: 94,
        last_activity: "Uploaded H&S assessment",
        status: 'active',
        role: "Safety Coordinator",
        company: "Kier Group"
      },
      {
        id: 3,
        email: "michael.obrien@example.com",
        first_name: "Michael",
        last_name: "O'Brien",
        cscs_card_number: "CSCS345678",
        is_active: false,
        progress: 45,
        last_login: "1 week ago",
        enrolled_date: "2024-01-05",
        completion_rate: 60,
        courses_enrolled: 1,
        certificates_earned: 0,
        avg_score: 72,
        last_activity: "Started GPS Training",
        status: 'inactive',
        role: "GPS Specialist",
        company: "Morgan Sindall"
      },
      {
        id: 4,
        email: "maria.rodriguez@example.com",
        first_name: "Maria",
        last_name: "Rodriguez",
        cscs_card_number: "CSCS456789",
        is_active: true,
        progress: 88,
        last_login: "3 hours ago",
        enrolled_date: "2024-01-12",
        completion_rate: 88,
        courses_enrolled: 4,
        certificates_earned: 3,
        avg_score: 91,
        last_activity: "Completed Utility Detection course",
        status: 'active',
        role: "Utility Detection Specialist",
        company: "Skanska"
      },
      {
        id: 5,
        email: "chen.wei@example.com",
        first_name: "Chen",
        last_name: "Wei",
        cscs_card_number: "CSCS567890",
        is_active: true,
        progress: 95,
        last_login: "30 minutes ago",
        enrolled_date: "2024-01-08",
        completion_rate: 95,
        courses_enrolled: 3,
        certificates_earned: 2,
        avg_score: 96,
        last_activity: "Achieved perfect score on H&S test",
        status: 'active',
        role: "Site Supervisor",
        company: "Laing O'Rourke"
      },
      {
        id: 6,
        email: "fatima.al-zahra@example.com",
        first_name: "Fatima",
        last_name: "Al-Zahra",
        cscs_card_number: "CSCS678901",
        is_active: true,
        progress: 67,
        last_login: "5 hours ago",
        enrolled_date: "2024-01-20",
        completion_rate: 67,
        courses_enrolled: 2,
        certificates_earned: 1,
        avg_score: 82,
        last_activity: "Submitted GPS Training assignment",
        status: 'active',
        role: "Machine Operator",
        company: "Willmott Dixon"
      },
      {
        id: 7,
        email: "kwame.asante@example.com",
        first_name: "Kwame",
        last_name: "Asante",
        cscs_card_number: "CSCS789012",
        is_active: true,
        progress: 78,
        last_login: "1 day ago",
        enrolled_date: "2024-01-18",
        completion_rate: 78,
        courses_enrolled: 3,
        certificates_earned: 2,
        avg_score: 85,
        last_activity: "Completed Plant Training practical",
        status: 'active',
        role: "Crane Operator",
        company: "Balfour Beatty"
      },
      {
        id: 8,
        email: "yuki.tanaka@example.com",
        first_name: "Yuki",
        last_name: "Tanaka",
        cscs_card_number: "CSCS890123",
        is_active: true,
        progress: 92,
        last_login: "2 hours ago",
        enrolled_date: "2024-01-14",
        completion_rate: 92,
        courses_enrolled: 2,
        certificates_earned: 2,
        avg_score: 93,
        last_activity: "Passed advanced GPS certification",
        status: 'active',
        role: "GPS Specialist",
        company: "Morgan Sindall"
      },
      {
        id: 9,
        email: "olga.petrov@example.com",
        first_name: "Olga",
        last_name: "Petrov",
        cscs_card_number: "CSCS901234",
        is_active: false,
        progress: 34,
        last_login: "2 weeks ago",
        enrolled_date: "2024-01-03",
        completion_rate: 34,
        courses_enrolled: 1,
        certificates_earned: 0,
        avg_score: 68,
        last_activity: "Started Health & Safety course",
        status: 'inactive',
        role: "Safety Inspector",
        company: "Kier Group"
      },
      {
        id: 10,
        email: "james.murphy@example.com",
        first_name: "James",
        last_name: "Murphy",
        cscs_card_number: "CSCS012345",
        is_active: true,
        progress: 81,
        last_login: "4 hours ago",
        enrolled_date: "2024-01-16",
        completion_rate: 81,
        courses_enrolled: 3,
        certificates_earned: 2,
        avg_score: 88,
        last_activity: "Completed Plant Training theory",
        status: 'active',
        role: "Plant Supervisor",
        company: "Skanska"
      },
      {
        id: 11,
        email: "aisha.ibrahim@example.com",
        first_name: "Aisha",
        last_name: "Ibrahim",
        cscs_card_number: "CSCS123450",
        is_active: true,
        progress: 76,
        last_login: "6 hours ago",
        enrolled_date: "2024-01-19",
        completion_rate: 76,
        courses_enrolled: 2,
        certificates_earned: 1,
        avg_score: 84,
        last_activity: "Uploaded utility detection report",
        status: 'active',
        role: "Utility Detection Technician",
        company: "Laing O'Rourke"
      },
      {
        id: 12,
        email: "carlos.mendez@example.com",
        first_name: "Carlos",
        last_name: "Mendez",
        cscs_card_number: "CSCS234561",
        is_active: true,
        progress: 89,
        last_login: "1 hour ago",
        enrolled_date: "2024-01-11",
        completion_rate: 89,
        courses_enrolled: 4,
        certificates_earned: 3,
        avg_score: 90,
        last_activity: "Achieved distinction in GPS Training",
        status: 'active',
        role: "GPS Training Instructor",
        company: "Morgan Sindall"
      },
      {
        id: 13,
        email: "sophie.dupont@example.com",
        first_name: "Sophie",
        last_name: "Dupont",
        cscs_card_number: "CSCS345672",
        is_active: true,
        progress: 83,
        last_login: "3 hours ago",
        enrolled_date: "2024-01-17",
        completion_rate: 83,
        courses_enrolled: 3,
        certificates_earned: 2,
        avg_score: 86,
        last_activity: "Completed Plant Training assessment",
        status: 'active',
        role: "Plant Training Coordinator",
        company: "Balfour Beatty"
      },
      {
        id: 14,
        email: "david.kim@example.com",
        first_name: "David",
        last_name: "Kim",
        cscs_card_number: "CSCS456783",
        is_active: false,
        progress: 52,
        last_login: "1 week ago",
        enrolled_date: "2024-01-06",
        completion_rate: 52,
        courses_enrolled: 2,
        certificates_earned: 0,
        avg_score: 75,
        last_activity: "Started Plant Training course",
        status: 'inactive',
        role: "Apprentice Plant Operator",
        company: "Kier Group"
      },
      {
        id: 15,
        email: "nadia.ahmed@example.com",
        first_name: "Nadia",
        last_name: "Ahmed",
        cscs_card_number: "CSCS567894",
        is_active: true,
        progress: 94,
        last_login: "30 minutes ago",
        enrolled_date: "2024-01-09",
        completion_rate: 94,
        courses_enrolled: 3,
        certificates_earned: 3,
        avg_score: 95,
        last_activity: "Completed all safety certifications",
        status: 'active',
        role: "Senior Safety Manager",
        company: "Willmott Dixon"
      }
    ];

    setStudents(mockStudents);
    setFilteredStudents(mockStudents);

    // Mock student courses
    setStudentCourses([
      {
        id: 1,
        title: "Plant Training & Testing",
        progress: 75,
        status: 'in_progress',
        enrolled_date: "2024-01-15",
        score: 87
      },
      {
        id: 2,
        title: "Health & Safety Short Course",
        progress: 100,
        status: 'completed',
        enrolled_date: "2024-01-10",
        completion_date: "2024-01-20",
        score: 94
      }
    ]);
  }, []);

  // Filter and search students
  useEffect(() => {
    let filtered = students.filter(student => {
      const matchesSearch = 
        student.first_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        student.last_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        student.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (student.cscs_card_number && student.cscs_card_number.toLowerCase().includes(searchTerm.toLowerCase()));
      
      const matchesFilter = filterStatus === 'all' || student.status === filterStatus;
      
      return matchesSearch && matchesFilter;
    });

    // Sort students
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return `${a.first_name} ${a.last_name}`.localeCompare(`${b.first_name} ${b.last_name}`);
        case 'progress':
          return (b.progress || 0) - (a.progress || 0);
        case 'last_login':
          return new Date(b.last_login || '').getTime() - new Date(a.last_login || '').getTime();
        case 'enrolled_date':
          return new Date(b.enrolled_date || '').getTime() - new Date(a.enrolled_date || '').getTime();
        default:
          return 0;
      }
    });

    setFilteredStudents(filtered);
  }, [students, searchTerm, filterStatus, sortBy]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'inactive': return 'bg-yellow-100 text-yellow-800';
      case 'suspended': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getProgressColor = (progress: number) => {
    if (progress >= 80) return 'text-green-600';
    if (progress >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const handleBulkAction = (action: string) => {
    console.log(`Bulk action: ${action} on students:`, selectedStudents);
    // Implement bulk actions
  };

  const handleStudentSelect = (studentId: number) => {
    setSelectedStudents(prev => 
      prev.includes(studentId) 
        ? prev.filter(id => id !== studentId)
        : [...prev, studentId]
    );
  };

  const handleSelectAll = () => {
    if (selectedStudents.length === filteredStudents.length) {
      setSelectedStudents([]);
    } else {
      setSelectedStudents(filteredStudents.map(s => s.id));
    }
  };

  return (
    <div className="space-y-6">
      {/* Header with Controls */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Student Management</h2>
          <p className="text-gray-600">Manage student enrollments, progress, and access</p>
        </div>
        
        <div className="flex items-center space-x-4">
          <Button onClick={() => setShowBulkActions(!showBulkActions)}>
            <Users className="h-4 w-4 mr-2" />
            Bulk Actions
          </Button>
          <Button>
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
          <Button>
            <UserPlus className="h-4 w-4 mr-2" />
            Add Student
          </Button>
        </div>
      </div>

      {/* Bulk Actions Panel */}
      {showBulkActions && (
        <Card className="bg-blue-50 border-blue-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <span className="text-sm font-medium text-blue-900">
                  {selectedStudents.length} students selected
                </span>
                <div className="flex space-x-2">
                  <Button size="sm" variant="outline" onClick={() => handleBulkAction('email')}>
                    <Mail className="h-4 w-4 mr-2" />
                    Send Email
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => handleBulkAction('enroll')}>
                    <BookOpen className="h-4 w-4 mr-2" />
                    Enroll in Course
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => handleBulkAction('export')}>
                    <Download className="h-4 w-4 mr-2" />
                    Export Data
                  </Button>
                </div>
              </div>
              <Button size="sm" variant="ghost" onClick={() => setSelectedStudents([])}>
                Clear Selection
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Filters and Search */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col lg:flex-row lg:items-center space-y-4 lg:space-y-0 lg:space-x-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="h-4 w-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <Input
                  placeholder="Search students by name, email, or CSCS number..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
                <option value="suspended">Suspended</option>
              </select>
              
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="name">Sort by Name</option>
                <option value="progress">Sort by Progress</option>
                <option value="last_login">Sort by Last Login</option>
                <option value="enrolled_date">Sort by Enrollment</option>
              </select>
              
              <div className="flex items-center space-x-2">
                <Button
                  variant={viewMode === 'grid' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setViewMode('grid')}
                >
                  Grid
                </Button>
                <Button
                  variant={viewMode === 'list' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setViewMode('list')}
                >
                  List
                </Button>
                <Button
                  variant={viewMode === 'table' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setViewMode('table')}
                >
                  Table
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Student Grid/List */}
      {viewMode === 'grid' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredStudents.map((student) => (
            <Card 
              key={student.id} 
              className={`hover:shadow-lg transition-all duration-200 cursor-pointer ${
                selectedStudents.includes(student.id) ? 'ring-2 ring-blue-500' : ''
              }`}
              onClick={() => setSelectedStudent(student)}
            >
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                      <span className="text-lg font-semibold text-blue-600">
                        {student.first_name.charAt(0)}{student.last_name.charAt(0)}
                      </span>
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">
                        {student.first_name} {student.last_name}
                      </h3>
                      <p className="text-sm text-gray-500">{student.role}</p>
                      <p className="text-xs text-gray-400">{student.company}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={selectedStudents.includes(student.id)}
                      onChange={(e) => {
                        e.stopPropagation();
                        handleStudentSelect(student.id);
                      }}
                      className="rounded border-gray-300"
                    />
                    <Button variant="ghost" size="sm">
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              
              <CardContent className="pt-0">
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-500">Progress</span>
                    <span className={`font-medium ${getProgressColor(student.progress || 0)}`}>
                      {student.progress || 0}%
                    </span>
                  </div>
                  <Progress value={student.progress || 0} className="h-2" />
                  
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-500">Courses</span>
                      <p className="font-medium">{student.courses_enrolled || 0}</p>
                    </div>
                    <div>
                      <span className="text-gray-500">Certificates</span>
                      <p className="font-medium">{student.certificates_earned || 0}</p>
                    </div>
                    <div>
                      <span className="text-gray-500">Avg Score</span>
                      <p className="font-medium">{student.avg_score || 0}%</p>
                    </div>
                    <div>
                      <span className="text-gray-500">Status</span>
                      <Badge className={getStatusColor(student.status || 'active')}>
                        {student.status || 'active'}
                      </Badge>
                    </div>
                  </div>
                  
                  <div className="pt-2 border-t border-gray-100">
                    <p className="text-xs text-gray-500">
                      Last activity: {student.last_activity}
                    </p>
                    <p className="text-xs text-gray-400">
                      Last login: {student.last_login}
                    </p>
                  </div>
                </div>

                <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-100">
                  <Button size="sm" variant="outline">
                    <Eye className="h-4 w-4 mr-2" />
                    View
                  </Button>
                  <Button size="sm" variant="outline">
                    <MessageSquare className="h-4 w-4 mr-2" />
                    Message
                  </Button>
                  <Button size="sm" className="bg-blue-600 hover:bg-blue-700">
                    <Edit className="h-4 w-4 mr-2" />
                    Manage
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Student List View */}
      {viewMode === 'list' && (
        <div className="space-y-4">
          {filteredStudents.map((student) => (
            <Card key={student.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <input
                      type="checkbox"
                      checked={selectedStudents.includes(student.id)}
                      onChange={() => handleStudentSelect(student.id)}
                      className="rounded border-gray-300"
                    />
                    <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                      <span className="text-lg font-semibold text-blue-600">
                        {student.first_name.charAt(0)}{student.last_name.charAt(0)}
                      </span>
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center space-x-3">
                        <h3 className="font-semibold text-gray-900">
                          {student.first_name} {student.last_name}
                        </h3>
                        <Badge className={getStatusColor(student.status || 'active')}>
                          {student.status || 'active'}
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-500">{student.email}</p>
                      <p className="text-xs text-gray-400">{student.role} at {student.company}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-6">
                    <div className="text-center">
                      <p className="text-sm text-gray-500">Progress</p>
                      <p className={`font-semibold ${getProgressColor(student.progress || 0)}`}>
                        {student.progress || 0}%
                      </p>
                    </div>
                    <div className="text-center">
                      <p className="text-sm text-gray-500">Courses</p>
                      <p className="font-semibold">{student.courses_enrolled || 0}</p>
                    </div>
                    <div className="text-center">
                      <p className="text-sm text-gray-500">Score</p>
                      <p className="font-semibold">{student.avg_score || 0}%</p>
                    </div>
                    <div className="flex space-x-2">
                      <Button size="sm" variant="outline">
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button size="sm" variant="outline">
                        <MessageSquare className="h-4 w-4" />
                      </Button>
                      <Button size="sm" className="bg-blue-600 hover:bg-blue-700">
                        <Edit className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Student Table View */}
      {viewMode === 'table' && (
        <Card>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-3 text-left">
                      <input
                        type="checkbox"
                        checked={selectedStudents.length === filteredStudents.length}
                        onChange={handleSelectAll}
                        className="rounded border-gray-300"
                      />
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Student
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Progress
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Courses
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Last Login
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredStudents.map((student) => (
                    <tr key={student.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <input
                          type="checkbox"
                          checked={selectedStudents.includes(student.id)}
                          onChange={() => handleStudentSelect(student.id)}
                          className="rounded border-gray-300"
                        />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                            <span className="text-sm font-semibold text-blue-600">
                              {student.first_name.charAt(0)}{student.last_name.charAt(0)}
                            </span>
                          </div>
                          <div>
                            <div className="text-sm font-medium text-gray-900">
                              {student.first_name} {student.last_name}
                            </div>
                            <div className="text-sm text-gray-500">{student.email}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <Badge className={getStatusColor(student.status || 'active')}>
                          {student.status || 'active'}
                        </Badge>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="w-16 bg-gray-200 rounded-full h-2 mr-2">
                            <div 
                              className="bg-blue-600 h-2 rounded-full" 
                              style={{ width: `${student.progress || 0}%` }}
                            ></div>
                          </div>
                          <span className={`text-sm font-medium ${getProgressColor(student.progress || 0)}`}>
                            {student.progress || 0}%
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {student.courses_enrolled || 0}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {student.last_login}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex space-x-2">
                          <Button size="sm" variant="outline">
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button size="sm" variant="outline">
                            <MessageSquare className="h-4 w-4" />
                          </Button>
                          <Button size="sm" className="bg-blue-600 hover:bg-blue-700">
                            <Edit className="h-4 w-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Student Details Modal */}
      {selectedStudent && (
        <Card className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <Card className="w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center">
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                    <span className="text-lg font-semibold text-blue-600">
                      {selectedStudent.first_name.charAt(0)}{selectedStudent.last_name.charAt(0)}
                    </span>
                  </div>
                  {selectedStudent.first_name} {selectedStudent.last_name}
                </CardTitle>
                <Button variant="ghost" onClick={() => setSelectedStudent(null)}>
                  ×
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Student Information</h3>
                  <div className="space-y-2">
                    <p><span className="font-medium">Email:</span> {selectedStudent.email}</p>
                    <p><span className="font-medium">CSCS Card:</span> {selectedStudent.cscs_card_number || 'Not provided'}</p>
                    <p><span className="font-medium">Role:</span> {selectedStudent.role}</p>
                    <p><span className="font-medium">Company:</span> {selectedStudent.company}</p>
                    <p><span className="font-medium">Enrolled:</span> {selectedStudent.enrolled_date}</p>
                    <p><span className="font-medium">Last Login:</span> {selectedStudent.last_login}</p>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Progress Overview</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center p-4 bg-blue-50 rounded-lg">
                      <p className="text-2xl font-bold text-blue-600">{selectedStudent.progress || 0}%</p>
                      <p className="text-sm text-gray-600">Overall Progress</p>
                    </div>
                    <div className="text-center p-4 bg-green-50 rounded-lg">
                      <p className="text-2xl font-bold text-green-600">{selectedStudent.courses_enrolled || 0}</p>
                      <p className="text-sm text-gray-600">Courses Enrolled</p>
                    </div>
                    <div className="text-center p-4 bg-purple-50 rounded-lg">
                      <p className="text-2xl font-bold text-purple-600">{selectedStudent.certificates_earned || 0}</p>
                      <p className="text-sm text-gray-600">Certificates</p>
                    </div>
                    <div className="text-center p-4 bg-yellow-50 rounded-lg">
                      <p className="text-2xl font-bold text-yellow-600">{selectedStudent.avg_score || 0}%</p>
                      <p className="text-sm text-gray-600">Average Score</p>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="mt-6">
                <h3 className="text-lg font-semibold mb-4">Course Progress</h3>
                <div className="space-y-3">
                  {studentCourses.map((course) => (
                    <div key={course.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div>
                        <p className="font-medium">{course.title}</p>
                        <p className="text-sm text-gray-500">Enrolled: {course.enrolled_date}</p>
                      </div>
                      <div className="flex items-center space-x-4">
                        <div className="text-center">
                          <p className="text-sm text-gray-500">Progress</p>
                          <p className="font-medium">{course.progress}%</p>
                        </div>
                        <div className="text-center">
                          <p className="text-sm text-gray-500">Status</p>
                          <Badge className={getStatusColor(course.status)}>
                            {course.status}
                          </Badge>
                        </div>
                        {course.score && (
                          <div className="text-center">
                            <p className="text-sm text-gray-500">Score</p>
                            <p className="font-medium">{course.score}%</p>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </Card>
      )}
    </div>
  );
}
