"use client";

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  User, 
  Mail, 
  Phone, 
  Calendar,
  Award,
  BookOpen,
  BarChart3,
  MessageSquare,
  Send,
  Plus,
  Edit,
  Trash2,
  CheckCircle,
  XCircle,
  Clock,
  TrendingUp,
  Target,
  FileText,
  Video,
  Download,
  Upload,
  Eye,
  Settings,
  ArrowLeft,
  Users,
  GraduationCap,
  Star,
  AlertCircle,
  CheckCircle2,
  Activity,
  Zap
} from 'lucide-react';

interface Student {
  id: number;
  email: string;
  profile: {
    first_name: string;
    last_name: string;
    phone_number?: string;
    cscs_card_number?: string;
    address?: string;
    emergency_contact?: string;
    qualifications?: string[];
  };
  role: string;
  is_active: boolean;
  is_verified: boolean;
  created_at: string;
  last_login?: string;
  courses_count?: number;
  completed_courses?: number;
  avg_score?: number;
  certificates_earned?: number;
}

interface Course {
  id: number;
  title: string;
  status: 'enrolled' | 'in_progress' | 'completed' | 'failed' | 'not_enrolled';
  progress: number;
  enrolled_date?: string;
  completion_date?: string;
  score?: number;
  last_accessed?: string;
  instructor_notes?: string;
}

interface Performance {
  course_id: number;
  course_title: string;
  score: number;
  attempts: number;
  time_spent: number;
  last_attempt: string;
  status: 'excellent' | 'good' | 'satisfactory' | 'needs_improvement';
}

interface Message {
  id: number;
  subject: string;
  content: string;
  sent_at: string;
  read_at?: string;
  type: 'course_update' | 'assignment' | 'reminder' | 'general';
}

interface Props {
  student: Student;
  onClose: () => void;
  onUpdate: (student: Student) => void;
}

export default function StudentProfileManagement({ student, onClose, onUpdate }: Props) {
  const [activeTab, setActiveTab] = useState('overview');
  const [courses, setCourses] = useState<Course[]>([]);
  const [performance, setPerformance] = useState<Performance[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState(student);
  const [newMessage, setNewMessage] = useState({ subject: '', content: '', type: 'general' as const });
  const [selectedCourses, setSelectedCourses] = useState<number[]>([]);

  // Mock data - replace with real API calls
  useEffect(() => {
    // Mock courses data
    setCourses([
      {
        id: 1,
        title: "Plant Training & Testing",
        status: 'in_progress',
        progress: 75,
        enrolled_date: "2024-01-15",
        last_accessed: "2 hours ago",
        score: 87,
        instructor_notes: "Excellent practical skills, needs more theory focus"
      },
      {
        id: 2,
        title: "Health & Safety Short Course",
        status: 'completed',
        progress: 100,
        enrolled_date: "2024-01-10",
        completion_date: "2024-01-20",
        score: 94,
        instructor_notes: "Outstanding performance, ready for advanced courses"
      },
      {
        id: 3,
        title: "GPS Training Advanced",
        status: 'not_enrolled',
        progress: 0,
        instructor_notes: "Recommended for next enrollment"
      }
    ]);

    // Mock performance data
    setPerformance([
      {
        course_id: 1,
        course_title: "Plant Training & Testing",
        score: 87,
        attempts: 2,
        time_spent: 12.5,
        last_attempt: "2024-01-20T14:30:00Z",
        status: 'good'
      },
      {
        course_id: 2,
        course_title: "Health & Safety Short Course",
        score: 94,
        attempts: 1,
        time_spent: 8.0,
        last_attempt: "2024-01-20T10:15:00Z",
        status: 'excellent'
      }
    ]);

    // Mock messages data
    setMessages([
      {
        id: 1,
        subject: "Welcome to Plant Training Course",
        content: "Welcome to the Plant Training & Testing course. Please review the course materials and complete the initial assessment.",
        sent_at: "2024-01-15T09:00:00Z",
        read_at: "2024-01-15T10:30:00Z",
        type: 'course_update'
      },
      {
        id: 2,
        subject: "Assignment Reminder",
        content: "Don't forget to submit your Health & Safety assessment by Friday.",
        sent_at: "2024-01-18T14:00:00Z",
        read_at: "2024-01-18T15:45:00Z",
        type: 'reminder'
      },
      {
        id: 3,
        subject: "Course Completion Certificate",
        content: "Congratulations! You have successfully completed the Health & Safety Short Course. Your certificate is now available for download.",
        sent_at: "2024-01-20T16:00:00Z",
        type: 'general'
      }
    ]);
  }, [student.id]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'enrolled': return 'bg-blue-100 text-blue-800';
      case 'in_progress': return 'bg-yellow-100 text-yellow-800';
      case 'completed': return 'bg-green-100 text-green-800';
      case 'failed': return 'bg-red-100 text-red-800';
      case 'not_enrolled': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPerformanceColor = (status: string) => {
    switch (status) {
      case 'excellent': return 'text-green-600';
      case 'good': return 'text-blue-600';
      case 'satisfactory': return 'text-yellow-600';
      case 'needs_improvement': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  const handleEnrollCourse = (courseId: number) => {
    setCourses(prev => prev.map(course => 
      course.id === courseId 
        ? { ...course, status: 'enrolled', enrolled_date: new Date().toISOString().split('T')[0] }
        : course
    ));
  };

  const handleSendMessage = () => {
    if (newMessage.subject && newMessage.content) {
      const message: Message = {
        id: Date.now(),
        ...newMessage,
        sent_at: new Date().toISOString()
      };
      setMessages(prev => [message, ...prev]);
      setNewMessage({ subject: '', content: '', type: 'general' });
    }
  };

  const handleBulkEnroll = () => {
    setCourses(prev => prev.map(course => 
      selectedCourses.includes(course.id) 
        ? { ...course, status: 'enrolled', enrolled_date: new Date().toISOString().split('T')[0] }
        : course
    ));
    setSelectedCourses([]);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg w-full max-w-6xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <div className="flex items-center space-x-4">
            <Button variant="ghost" onClick={onClose}>
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div>
              <h2 className="text-2xl font-bold text-gray-900">
                {student.profile.first_name} {student.profile.last_name}
              </h2>
              <p className="text-gray-600">{student.email}</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Button variant="outline" onClick={() => setIsEditing(!isEditing)}>
              <Edit className="h-4 w-4 mr-2" />
              {isEditing ? 'Cancel' : 'Edit'}
            </Button>
            <Button onClick={onClose}>
              Close
            </Button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <TabsList className="grid w-full grid-cols-5">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="courses">Courses</TabsTrigger>
              <TabsTrigger value="performance">Performance</TabsTrigger>
              <TabsTrigger value="messages">Messages</TabsTrigger>
              <TabsTrigger value="settings">Settings</TabsTrigger>
            </TabsList>

            {/* Overview Tab */}
            <TabsContent value="overview" className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Student Info */}
                <div className="lg:col-span-2">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center">
                        <User className="h-5 w-5 mr-2" />
                        Student Information
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {isEditing ? (
                        <div className="space-y-4">
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <Label htmlFor="first_name">First Name</Label>
                              <Input
                                id="first_name"
                                value={editData.profile.first_name}
                                onChange={(e) => setEditData({
                                  ...editData,
                                  profile: { ...editData.profile, first_name: e.target.value }
                                })}
                              />
                            </div>
                            <div>
                              <Label htmlFor="last_name">Last Name</Label>
                              <Input
                                id="last_name"
                                value={editData.profile.last_name}
                                onChange={(e) => setEditData({
                                  ...editData,
                                  profile: { ...editData.profile, last_name: e.target.value }
                                })}
                              />
                            </div>
                          </div>
                          <div>
                            <Label htmlFor="email">Email</Label>
                            <Input
                              id="email"
                              value={editData.email}
                              onChange={(e) => setEditData({ ...editData, email: e.target.value })}
                            />
                          </div>
                          <div>
                            <Label htmlFor="phone">Phone</Label>
                            <Input
                              id="phone"
                              value={editData.profile.phone_number || ''}
                              onChange={(e) => setEditData({
                                ...editData,
                                profile: { ...editData.profile, phone_number: e.target.value }
                              })}
                            />
                          </div>
                          <div>
                            <Label htmlFor="cscs">CSCS Card Number</Label>
                            <Input
                              id="cscs"
                              value={editData.profile.cscs_card_number || ''}
                              onChange={(e) => setEditData({
                                ...editData,
                                profile: { ...editData.profile, cscs_card_number: e.target.value }
                              })}
                            />
                          </div>
                          <div className="flex space-x-2">
                            <Button onClick={() => {
                              onUpdate(editData);
                              setIsEditing(false);
                            }}>
                              Save Changes
                            </Button>
                            <Button variant="outline" onClick={() => {
                              setEditData(student);
                              setIsEditing(false);
                            }}>
                              Cancel
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <div className="space-y-3">
                          <div className="flex items-center space-x-3">
                            <Mail className="h-4 w-4 text-gray-500" />
                            <span>{student.email}</span>
                          </div>
                          {student.profile.phone_number && (
                            <div className="flex items-center space-x-3">
                              <Phone className="h-4 w-4 text-gray-500" />
                              <span>{student.profile.phone_number}</span>
                            </div>
                          )}
                          {student.profile.cscs_card_number && (
                            <div className="flex items-center space-x-3">
                              <Award className="h-4 w-4 text-gray-500" />
                              <span>CSCS: {student.profile.cscs_card_number}</span>
                            </div>
                          )}
                          <div className="flex items-center space-x-3">
                            <Calendar className="h-4 w-4 text-gray-500" />
                            <span>Joined {new Date(student.created_at).toLocaleDateString()}</span>
                          </div>
                          {student.last_login && (
                            <div className="flex items-center space-x-3">
                              <Activity className="h-4 w-4 text-gray-500" />
                              <span>Last login: {student.last_login}</span>
                            </div>
                          )}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </div>

                {/* Quick Stats */}
                <div className="space-y-4">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center">
                        <BarChart3 className="h-5 w-5 mr-2" />
                        Quick Stats
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="text-center">
                        <div className="text-3xl font-bold text-blue-600">
                          {student.courses_count || 0}
                        </div>
                        <div className="text-sm text-gray-600">Courses Enrolled</div>
                      </div>
                      <div className="text-center">
                        <div className="text-3xl font-bold text-green-600">
                          {student.completed_courses || 0}
                        </div>
                        <div className="text-sm text-gray-600">Completed</div>
                      </div>
                      <div className="text-center">
                        <div className="text-3xl font-bold text-purple-600">
                          {student.avg_score || 0}%
                        </div>
                        <div className="text-sm text-gray-600">Average Score</div>
                      </div>
                      <div className="text-center">
                        <div className="text-3xl font-bold text-yellow-600">
                          {student.certificates_earned || 0}
                        </div>
                        <div className="text-sm text-gray-600">Certificates</div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center">
                        <Target className="h-5 w-5 mr-2" />
                        Status
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span>Account Status</span>
                        <Badge className={student.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}>
                          {student.is_active ? 'Active' : 'Inactive'}
                        </Badge>
                      </div>
                      <div className="flex items-center justify-between">
                        <span>Verification</span>
                        <Badge className={student.is_verified ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}>
                          {student.is_verified ? 'Verified' : 'Pending'}
                        </Badge>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </TabsContent>

            {/* Courses Tab */}
            <TabsContent value="courses" className="space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">Course Management</h3>
                <div className="flex space-x-2">
                  <Button onClick={handleBulkEnroll} disabled={selectedCourses.length === 0}>
                    <Plus className="h-4 w-4 mr-2" />
                    Enroll Selected
                  </Button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {courses.map((course) => (
                  <Card key={course.id} className={`${selectedCourses.includes(course.id) ? 'ring-2 ring-blue-500' : ''}`}>
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <CardTitle className="text-lg">{course.title}</CardTitle>
                          <Badge className={getStatusColor(course.status)}>
                            {course.status.replace('_', ' ')}
                          </Badge>
                        </div>
                        <input
                          type="checkbox"
                          checked={selectedCourses.includes(course.id)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedCourses(prev => [...prev, course.id]);
                            } else {
                              setSelectedCourses(prev => prev.filter(id => id !== course.id));
                            }
                          }}
                          className="rounded border-gray-300"
                        />
                      </div>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <div className="space-y-3">
                        {course.progress > 0 && (
                          <div>
                            <div className="flex justify-between text-sm mb-1">
                              <span>Progress</span>
                              <span>{course.progress}%</span>
                            </div>
                            <Progress value={course.progress} className="h-2" />
                          </div>
                        )}
                        
                        {course.enrolled_date && (
                          <div className="text-sm text-gray-600">
                            Enrolled: {new Date(course.enrolled_date).toLocaleDateString()}
                          </div>
                        )}
                        
                        {course.score && (
                          <div className="text-sm text-gray-600">
                            Score: {course.score}%
                          </div>
                        )}

                        {course.instructor_notes && (
                          <div className="text-sm text-gray-600 italic">
                            Notes: {course.instructor_notes}
                          </div>
                        )}

                        <div className="flex space-x-2">
                          {course.status === 'not_enrolled' && (
                            <Button 
                              size="sm" 
                              onClick={() => handleEnrollCourse(course.id)}
                              className="flex-1"
                            >
                              <Plus className="h-4 w-4 mr-2" />
                              Enroll
                            </Button>
                          )}
                          <Button size="sm" variant="outline" className="flex-1">
                            <Eye className="h-4 w-4 mr-2" />
                            View
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            {/* Performance Tab */}
            <TabsContent value="performance" className="space-y-6">
              <h3 className="text-lg font-semibold">Performance Analytics</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {performance.map((perf) => (
                  <Card key={perf.course_id}>
                    <CardHeader>
                      <CardTitle className="text-lg">{perf.course_title}</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <div className="text-2xl font-bold text-blue-600">{perf.score}%</div>
                          <div className="text-sm text-gray-600">Final Score</div>
                        </div>
                        <div>
                          <div className="text-2xl font-bold text-green-600">{perf.attempts}</div>
                          <div className="text-sm text-gray-600">Attempts</div>
                        </div>
                        <div>
                          <div className="text-2xl font-bold text-purple-600">{perf.time_spent}h</div>
                          <div className="text-sm text-gray-600">Time Spent</div>
                        </div>
                        <div>
                          <div className={`text-2xl font-bold ${getPerformanceColor(perf.status)}`}>
                            {perf.status.replace('_', ' ')}
                          </div>
                          <div className="text-sm text-gray-600">Performance</div>
                        </div>
                      </div>
                      
                      <div className="pt-4 border-t">
                        <div className="text-sm text-gray-600">
                          Last Attempt: {new Date(perf.last_attempt).toLocaleDateString()}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            {/* Messages Tab */}
            <TabsContent value="messages" className="space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">Communication</h3>
                <Button onClick={() => setActiveTab('messages')}>
                  <Send className="h-4 w-4 mr-2" />
                  Send Message
                </Button>
              </div>

              {/* Send Message Form */}
              <Card>
                <CardHeader>
                  <CardTitle>Send Message</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="subject">Subject</Label>
                    <Input
                      id="subject"
                      value={newMessage.subject}
                      onChange={(e) => setNewMessage({ ...newMessage, subject: e.target.value })}
                      placeholder="Enter message subject"
                    />
                  </div>
                  <div>
                    <Label htmlFor="type">Message Type</Label>
                    <select
                      id="type"
                      value={newMessage.type}
                      onChange={(e) => setNewMessage({ ...newMessage, type: e.target.value as any })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    >
                      <option value="general">General</option>
                      <option value="course_update">Course Update</option>
                      <option value="assignment">Assignment</option>
                      <option value="reminder">Reminder</option>
                    </select>
                  </div>
                  <div>
                    <Label htmlFor="content">Message</Label>
                    <Textarea
                      id="content"
                      value={newMessage.content}
                      onChange={(e) => setNewMessage({ ...newMessage, content: e.target.value })}
                      placeholder="Enter your message"
                      rows={4}
                    />
                  </div>
                  <Button onClick={handleSendMessage} disabled={!newMessage.subject || !newMessage.content}>
                    <Send className="h-4 w-4 mr-2" />
                    Send Message
                  </Button>
                </CardContent>
              </Card>

              {/* Message History */}
              <div className="space-y-4">
                <h4 className="text-md font-semibold">Message History</h4>
                {messages.map((message) => (
                  <Card key={message.id}>
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <h5 className="font-semibold">{message.subject}</h5>
                          <p className="text-sm text-gray-600">
                            {new Date(message.sent_at).toLocaleString()}
                          </p>
                        </div>
                        <Badge variant="outline">{message.type.replace('_', ' ')}</Badge>
                      </div>
                      <p className="text-gray-700">{message.content}</p>
                      {message.read_at && (
                        <div className="mt-2 text-sm text-green-600 flex items-center">
                          <CheckCircle2 className="h-4 w-4 mr-1" />
                          Read {new Date(message.read_at).toLocaleString()}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            {/* Settings Tab */}
            <TabsContent value="settings" className="space-y-6">
              <h3 className="text-lg font-semibold">Student Settings</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Account Management</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span>Account Status</span>
                      <Button variant="outline" size="sm">
                        {student.is_active ? 'Deactivate' : 'Activate'}
                      </Button>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Verification Status</span>
                      <Button variant="outline" size="sm">
                        {student.is_verified ? 'Unverify' : 'Verify'}
                      </Button>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Reset Password</span>
                      <Button variant="outline" size="sm">
                        Send Reset Link
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Course Access</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span>Auto-enroll in new courses</span>
                      <Button variant="outline" size="sm">
                        Enable
                      </Button>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Email notifications</span>
                      <Button variant="outline" size="sm">
                        Configure
                      </Button>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Progress tracking</span>
                      <Button variant="outline" size="sm">
                        Enable
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}
