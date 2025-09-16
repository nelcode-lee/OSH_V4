"use client";

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  BarChart3, 
  TrendingUp, 
  TrendingDown,
  Users, 
  BookOpen, 
  Award,
  Clock,
  Target,
  Activity,
  Calendar,
  Download,
  Filter,
  RefreshCw,
  Eye,
  Star,
  CheckCircle,
  AlertCircle,
  Zap,
  ArrowUp,
  ArrowDown,
  Minus
} from 'lucide-react';

interface AnalyticsData {
  totalStudents: number;
  totalCourses: number;
  completionRate: number;
  avgScore: number;
  activeUsers: number;
  newEnrollments: number;
  courseCompletions: number;
  revenue: number;
  growthRate: number;
}

interface CoursePerformance {
  id: number;
  title: string;
  enrollments: number;
  completions: number;
  avgScore: number;
  completionRate: number;
  revenue: number;
  trend: 'up' | 'down' | 'stable';
}

interface StudentEngagement {
  date: string;
  activeUsers: number;
  courseViews: number;
  testSubmissions: number;
  completions: number;
}

interface TopPerformer {
  id: number;
  name: string;
  courses: number;
  score: number;
  certificates: number;
  lastActivity: string;
}

export default function EnhancedAnalyticsDashboard() {
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null);
  const [coursePerformance, setCoursePerformance] = useState<CoursePerformance[]>([]);
  const [studentEngagement, setStudentEngagement] = useState<StudentEngagement[]>([]);
  const [topPerformers, setTopPerformers] = useState<TopPerformer[]>([]);
  const [timeRange, setTimeRange] = useState('30d');
  const [selectedMetric, setSelectedMetric] = useState('enrollments');

  // Mock data - replace with real API calls
  useEffect(() => {
    setAnalyticsData({
      totalStudents: 127,
      totalCourses: 8,
      completionRate: 87,
      avgScore: 84,
      activeUsers: 89,
      newEnrollments: 23,
      courseCompletions: 18,
      revenue: 45600,
      growthRate: 12.5
    });

    setCoursePerformance([
      {
        id: 1,
        title: "Plant Training & Testing",
        enrollments: 45,
        completions: 38,
        avgScore: 87,
        completionRate: 84,
        revenue: 15200,
        trend: 'up'
      },
      {
        id: 2,
        title: "Health & Safety Short Course",
        enrollments: 32,
        completions: 29,
        avgScore: 91,
        completionRate: 91,
        revenue: 11600,
        trend: 'up'
      },
      {
        id: 3,
        title: "GPS Training Advanced",
        enrollments: 18,
        completions: 12,
        avgScore: 78,
        completionRate: 67,
        revenue: 7200,
        trend: 'down'
      },
      {
        id: 4,
        title: "Utility Detection Training",
        enrollments: 25,
        completions: 20,
        avgScore: 85,
        completionRate: 80,
        revenue: 10000,
        trend: 'stable'
      }
    ]);

    setStudentEngagement([
      { date: '2024-01-01', activeUsers: 45, courseViews: 120, testSubmissions: 35, completions: 8 },
      { date: '2024-01-02', activeUsers: 52, courseViews: 145, testSubmissions: 42, completions: 12 },
      { date: '2024-01-03', activeUsers: 48, courseViews: 138, testSubmissions: 38, completions: 10 },
      { date: '2024-01-04', activeUsers: 61, courseViews: 165, testSubmissions: 48, completions: 15 },
      { date: '2024-01-05', activeUsers: 55, courseViews: 152, testSubmissions: 44, completions: 13 },
      { date: '2024-01-06', activeUsers: 67, courseViews: 178, testSubmissions: 52, completions: 18 },
      { date: '2024-01-07', activeUsers: 72, courseViews: 195, testSubmissions: 58, completions: 22 }
    ]);

    setTopPerformers([
      {
        id: 1,
        name: "John Doe",
        courses: 4,
        score: 94,
        certificates: 3,
        lastActivity: "2 hours ago"
      },
      {
        id: 2,
        name: "Jane Smith",
        courses: 3,
        score: 91,
        certificates: 2,
        lastActivity: "1 hour ago"
      },
      {
        id: 3,
        name: "Mike Wilson",
        courses: 2,
        score: 88,
        certificates: 1,
        lastActivity: "4 hours ago"
      }
    ]);
  }, []);

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up': return <ArrowUp className="h-4 w-4 text-green-500" />;
      case 'down': return <ArrowDown className="h-4 w-4 text-red-500" />;
      default: return <Minus className="h-4 w-4 text-gray-500" />;
    }
  };

  const getTrendColor = (trend: string) => {
    switch (trend) {
      case 'up': return 'text-green-600';
      case 'down': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-GB', {
      style: 'currency',
      currency: 'GBP'
    }).format(amount);
  };

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('en-GB').format(num);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Analytics Dashboard</h2>
          <p className="text-gray-600">Track performance, engagement, and key metrics</p>
        </div>
        
        <div className="flex items-center space-x-4">
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="7d">Last 7 days</option>
            <option value="30d">Last 30 days</option>
            <option value="90d">Last 90 days</option>
            <option value="1y">Last year</option>
          </select>
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Export Report
          </Button>
          <Button>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Key Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="hover:shadow-lg transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Students</p>
                <p className="text-3xl font-bold text-gray-900">{analyticsData?.totalStudents || 0}</p>
                <p className="text-xs text-green-600 flex items-center mt-1">
                  <TrendingUp className="h-3 w-3 mr-1" />
                  +{analyticsData?.growthRate || 0}% from last month
                </p>
              </div>
              <div className="p-3 bg-blue-100 rounded-full">
                <Users className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Completion Rate</p>
                <p className="text-3xl font-bold text-gray-900">{analyticsData?.completionRate || 0}%</p>
                <div className="mt-2">
                  <Progress value={analyticsData?.completionRate || 0} className="h-2" />
                </div>
              </div>
              <div className="p-3 bg-green-100 rounded-full">
                <Target className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Average Score</p>
                <p className="text-3xl font-bold text-gray-900">{analyticsData?.avgScore || 0}%</p>
                <p className="text-xs text-blue-600 flex items-center mt-1">
                  <Star className="h-3 w-3 mr-1" />
                  Excellent performance
                </p>
              </div>
              <div className="p-3 bg-yellow-100 rounded-full">
                <Award className="h-6 w-6 text-yellow-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Revenue</p>
                <p className="text-3xl font-bold text-gray-900">{formatCurrency(analyticsData?.revenue || 0)}</p>
                <p className="text-xs text-green-600 flex items-center mt-1">
                  <TrendingUp className="h-3 w-3 mr-1" />
                  +8.2% from last month
                </p>
              </div>
              <div className="p-3 bg-purple-100 rounded-full">
                <BarChart3 className="h-6 w-6 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Course Performance */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center">
                  <BookOpen className="h-5 w-5 mr-2 text-blue-500" />
                  Course Performance
                </CardTitle>
                <div className="flex space-x-2">
                  <Button size="sm" variant="outline">
                    <Filter className="h-4 w-4 mr-2" />
                    Filter
                  </Button>
                  <Button size="sm" variant="outline">
                    <Eye className="h-4 w-4 mr-2" />
                    View All
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {coursePerformance.map((course) => (
                  <div key={course.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3">
                        <h3 className="font-semibold text-gray-900">{course.title}</h3>
                        <div className="flex items-center space-x-1">
                          {getTrendIcon(course.trend)}
                          <span className={`text-sm font-medium ${getTrendColor(course.trend)}`}>
                            {course.trend === 'up' ? '+' : course.trend === 'down' ? '-' : '='}
                          </span>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-2">
                        <div>
                          <p className="text-xs text-gray-500">Enrollments</p>
                          <p className="font-semibold">{formatNumber(course.enrollments)}</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500">Completions</p>
                          <p className="font-semibold">{formatNumber(course.completions)}</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500">Avg Score</p>
                          <p className="font-semibold">{course.avgScore}%</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500">Revenue</p>
                          <p className="font-semibold">{formatCurrency(course.revenue)}</p>
                        </div>
                      </div>
                    </div>
                    <div className="ml-4">
                      <div className="text-right">
                        <p className="text-sm font-medium text-gray-900">{course.completionRate}%</p>
                        <p className="text-xs text-gray-500">Completion Rate</p>
                      </div>
                      <Progress value={course.completionRate} className="h-2 w-20 mt-1" />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Top Performers */}
        <div>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Award className="h-5 w-5 mr-2 text-yellow-500" />
                Top Performers
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {topPerformers.map((performer, index) => (
                  <div key={performer.id} className="flex items-center space-x-3">
                    <div className="flex-shrink-0">
                      <div className="w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center">
                        <span className="text-sm font-bold text-yellow-600">#{index + 1}</span>
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">{performer.name}</p>
                      <div className="flex items-center space-x-4 text-xs text-gray-500">
                        <span>{performer.courses} courses</span>
                        <span>{performer.score}% avg</span>
                        <span>{performer.certificates} certs</span>
                      </div>
                    </div>
                    <div className="flex-shrink-0">
                      <Badge variant="outline" className="text-xs">
                        {performer.lastActivity}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
              <Button variant="ghost" className="w-full mt-4">
                View All Students
              </Button>
            </CardContent>
          </Card>

          {/* Quick Stats */}
          <Card className="mt-6">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Activity className="h-5 w-5 mr-2 text-green-500" />
                This Week
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">New Enrollments</span>
                  <span className="text-sm font-medium text-green-600">+{analyticsData?.newEnrollments || 0}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Course Completions</span>
                  <span className="text-sm font-medium text-blue-600">+{analyticsData?.courseCompletions || 0}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Active Users</span>
                  <span className="text-sm font-medium text-purple-600">{analyticsData?.activeUsers || 0}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Test Submissions</span>
                  <span className="text-sm font-medium text-orange-600">+127</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Engagement Chart */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <BarChart3 className="h-5 w-5 mr-2 text-purple-500" />
            Student Engagement Trends
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64 flex items-center justify-center bg-gray-50 rounded-lg">
            <div className="text-center">
              <BarChart3 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">Chart visualization would go here</p>
              <p className="text-sm text-gray-400">Integration with charting library needed</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Clock className="h-5 w-5 mr-2 text-indigo-500" />
            Recent Activity
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center space-x-3">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <div className="flex-1">
                <p className="text-sm text-gray-900">John Doe completed Plant Training & Testing</p>
                <p className="text-xs text-gray-500">2 hours ago</p>
              </div>
              <Badge className="bg-green-100 text-green-800">Completed</Badge>
            </div>
            <div className="flex items-center space-x-3">
              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
              <div className="flex-1">
                <p className="text-sm text-gray-900">Jane Smith enrolled in GPS Training Advanced</p>
                <p className="text-xs text-gray-500">4 hours ago</p>
              </div>
              <Badge className="bg-blue-100 text-blue-800">Enrolled</Badge>
            </div>
            <div className="flex items-center space-x-3">
              <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
              <div className="flex-1">
                <p className="text-sm text-gray-900">Mike Wilson submitted H&S assessment</p>
                <p className="text-xs text-gray-500">6 hours ago</p>
              </div>
              <Badge className="bg-yellow-100 text-yellow-800">Submitted</Badge>
            </div>
            <div className="flex items-center space-x-3">
              <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
              <div className="flex-1">
                <p className="text-sm text-gray-900">New course content uploaded</p>
                <p className="text-xs text-gray-500">1 day ago</p>
              </div>
              <Badge className="bg-purple-100 text-purple-800">Content</Badge>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
