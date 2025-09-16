"use client";

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import Navigation from '@/components/navigation';
import { 
  ArrowLeft,
  Plus,
  Upload,
  Save,
  Eye,
  X,
  Calendar,
  Clock,
  Users,
  Award,
  BookOpen,
  Target,
  Settings,
  Image as ImageIcon,
  FileText,
  Video,
  Link as LinkIcon,
  CheckCircle,
  AlertCircle,
  Loader2,
  Sparkles,
  Database,
  ToggleLeft,
  ToggleRight
} from 'lucide-react';
import { api, getAuthHeaders } from '@/lib/api';
import Link from 'next/link';

interface CourseFormData {
  title: string;
  description: string;
  short_description: string;
  category: string;
  difficulty_level: string;
  duration_hours: number;
  max_students: number;
  prerequisites: string[];
  learning_objectives: string[];
  course_outline: string;
  assessment_criteria: string;
  certification_info: string;
  is_public: boolean;
  requires_approval: boolean;
  allow_self_enrollment: boolean;
  start_date: string;
  end_date: string;
  tags: string[];
  featured_image: File | null;
  course_materials: File[];
}

export default function CourseCreationPage() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<CourseFormData>({
    title: '',
    description: '',
    short_description: '',
    category: '',
    difficulty_level: 'intermediate',
    duration_hours: 8,
    max_students: 20,
    prerequisites: [],
    learning_objectives: [],
    course_outline: '',
    assessment_criteria: '',
    certification_info: '',
    is_public: true,
    requires_approval: false,
    allow_self_enrollment: true,
    start_date: '',
    end_date: '',
    tags: [],
    featured_image: null,
    course_materials: []
  });

  const [newPrerequisite, setNewPrerequisite] = useState('');
  const [newObjective, setNewObjective] = useState('');
  const [newTag, setNewTag] = useState('');

  const categories = [
    'Plant Training',
    'Health & Safety',
    'GPS Training',
    'Utility Detection',
    'NRSWA',
    'Site Safety',
    'Apprenticeships',
    'NOCN',
    'Other'
  ];

  const difficultyLevels = [
    { value: 'beginner', label: 'Beginner', description: 'No prior experience required' },
    { value: 'intermediate', label: 'Intermediate', description: 'Some experience recommended' },
    { value: 'advanced', label: 'Advanced', description: 'Significant experience required' }
  ];

  const steps = [
    { id: 1, title: 'Basic Information', description: 'Course title, description, and category' },
    { id: 2, title: 'Course Details', description: 'Duration, difficulty, and capacity' },
    { id: 3, title: 'Content & Objectives', description: 'Learning objectives and course outline' },
    { id: 4, title: 'Assessment & Certification', description: 'Assessment criteria and certification info' },
    { id: 5, title: 'Settings & Access', description: 'Visibility, enrollment, and approval settings' },
    { id: 6, title: 'Media & Materials', description: 'Images, files, and course materials' }
  ];

  const handleInputChange = (field: keyof CourseFormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleArrayAdd = (field: 'prerequisites' | 'learning_objectives' | 'tags', value: string, setter: (value: string) => void) => {
    if (value.trim()) {
      setFormData(prev => ({
        ...prev,
        [field]: [...prev[field], value.trim()]
      }));
      setter('');
    }
  };

  const handleArrayRemove = (field: 'prerequisites' | 'learning_objectives' | 'tags', index: number) => {
    setFormData(prev => ({
      ...prev,
      [field]: prev[field].filter((_, i) => i !== index)
    }));
  };

  const handleFileUpload = (field: 'featured_image' | 'course_materials', file: File) => {
    if (field === 'featured_image') {
      setFormData(prev => ({ ...prev, featured_image: file }));
    } else {
      setFormData(prev => ({ ...prev, course_materials: [...prev.course_materials, file] }));
    }
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      const token = localStorage.getItem('token');
      const formDataToSend = new FormData();
      
      // Add all form fields
      Object.entries(formData).forEach(([key, value]) => {
        if (key === 'featured_image' && value) {
          formDataToSend.append('featured_image', value);
        } else if (key === 'course_materials' && Array.isArray(value)) {
          value.forEach((file, index) => {
            formDataToSend.append(`course_materials_${index}`, file);
          });
        } else if (Array.isArray(value)) {
          formDataToSend.append(key, JSON.stringify(value));
        } else {
          formDataToSend.append(key, String(value));
        }
      });

      const response = await fetch(`${api.baseUrl}/api/courses/`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formDataToSend
      });

      if (response.ok) {
        const result = await response.json();
        alert('Course created successfully!');
        // Redirect to course management or the new course
        window.location.href = '/course-management';
      } else {
        const error = await response.json();
        alert('Error creating course: ' + (error.message || 'Unknown error'));
      }
    } catch (error) {
      console.error('Error creating course:', error);
      alert('Error creating course');
    } finally {
      setIsSubmitting(false);
    }
  };

  const nextStep = () => {
    if (currentStep < steps.length) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="space-y-6">
                <div className="group">
                  <Label htmlFor="title" className="text-base font-semibold text-gray-900 mb-3 block">
                    Course Title *
                  </Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => handleInputChange('title', e.target.value)}
                    placeholder="Enter course title"
                    className="h-12 text-lg border-2 border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-200 rounded-xl"
                  />
                  <p className="text-sm text-gray-500 mt-2">Choose a clear, descriptive title that reflects the course content</p>
                </div>

                <div className="group">
                  <Label htmlFor="category" className="text-base font-semibold text-gray-900 mb-3 block">
                    Category *
                  </Label>
                  <Select
                    value={formData.category}
                    onValueChange={(value) => handleInputChange('category', value)}
                  >
                    <SelectTrigger className="h-12 text-lg border-2 border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-200 rounded-xl">
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent className="rounded-xl border-2">
                      {categories.map((category) => (
                        <SelectItem key={category} value={category} className="text-base py-3">
                          {category}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <p className="text-sm text-gray-500 mt-2">Select the most appropriate category for your course</p>
                </div>
              </div>

              <div className="space-y-6">
                <div className="group">
                  <Label htmlFor="short_description" className="text-base font-semibold text-gray-900 mb-3 block">
                    Short Description *
                  </Label>
                  <Textarea
                    id="short_description"
                    value={formData.short_description}
                    onChange={(e) => handleInputChange('short_description', e.target.value)}
                    placeholder="Brief description (1-2 sentences)"
                    className="border-2 border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-200 rounded-xl resize-none"
                    rows={3}
                  />
                  <p className="text-sm text-gray-500 mt-2">This will appear in course listings and previews</p>
                </div>
              </div>
            </div>

            <div className="group">
              <Label htmlFor="description" className="text-base font-semibold text-gray-900 mb-3 block">
                Full Description *
              </Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                placeholder="Detailed course description including what students will learn, who it's for, and what they'll achieve"
                className="border-2 border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-200 rounded-xl resize-none"
                rows={6}
              />
              <p className="text-sm text-gray-500 mt-2">Provide a comprehensive overview of your course content and objectives</p>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-8">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="group">
                <Label htmlFor="duration_hours" className="text-base font-semibold text-gray-900 mb-3 block flex items-center">
                  <Clock className="h-5 w-5 mr-2 text-blue-600" />
                  Duration (Hours) *
                </Label>
                <Input
                  id="duration_hours"
                  type="number"
                  value={formData.duration_hours}
                  onChange={(e) => handleInputChange('duration_hours', parseInt(e.target.value))}
                  className="h-12 text-lg border-2 border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-200 rounded-xl"
                  placeholder="8"
                />
                <p className="text-sm text-gray-500 mt-2">Total course duration in hours</p>
              </div>

              <div className="group">
                <Label htmlFor="max_students" className="text-base font-semibold text-gray-900 mb-3 block flex items-center">
                  <Users className="h-5 w-5 mr-2 text-green-600" />
                  Maximum Students
                </Label>
                <Input
                  id="max_students"
                  type="number"
                  value={formData.max_students}
                  onChange={(e) => handleInputChange('max_students', parseInt(e.target.value))}
                  className="h-12 text-lg border-2 border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-200 rounded-xl"
                  placeholder="20"
                />
                <p className="text-sm text-gray-500 mt-2">Maximum number of students allowed</p>
              </div>

              <div className="group">
                <Label htmlFor="difficulty_level" className="text-base font-semibold text-gray-900 mb-3 block flex items-center">
                  <Target className="h-5 w-5 mr-2 text-orange-600" />
                  Difficulty Level *
                </Label>
                <Select
                  value={formData.difficulty_level}
                  onValueChange={(value) => handleInputChange('difficulty_level', value)}
                >
                  <SelectTrigger className="h-12 text-lg border-2 border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-200 rounded-xl">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="rounded-xl border-2">
                    {difficultyLevels.map((level) => (
                      <SelectItem key={level.value} value={level.value} className="text-base py-3">
                        <div className="flex flex-col">
                          <div className="font-medium">{level.label}</div>
                          <div className="text-sm text-gray-500">{level.description}</div>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-sm text-gray-500 mt-2">Choose the appropriate difficulty level</p>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="group">
                <Label htmlFor="start_date" className="text-base font-semibold text-gray-900 mb-3 block flex items-center">
                  <Calendar className="h-5 w-5 mr-2 text-purple-600" />
                  Start Date
                </Label>
                <Input
                  id="start_date"
                  type="date"
                  value={formData.start_date}
                  onChange={(e) => handleInputChange('start_date', e.target.value)}
                  className="h-12 text-lg border-2 border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-200 rounded-xl"
                />
                <p className="text-sm text-gray-500 mt-2">When the course becomes available</p>
              </div>

              <div className="group">
                <Label htmlFor="end_date" className="text-base font-semibold text-gray-900 mb-3 block flex items-center">
                  <Calendar className="h-5 w-5 mr-2 text-red-600" />
                  End Date
                </Label>
                <Input
                  id="end_date"
                  type="date"
                  value={formData.end_date}
                  onChange={(e) => handleInputChange('end_date', e.target.value)}
                  className="h-12 text-lg border-2 border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-200 rounded-xl"
                />
                <p className="text-sm text-gray-500 mt-2">When the course enrollment closes</p>
              </div>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <div>
              <Label>Learning Objectives</Label>
              <div className="mt-2 space-y-2">
                <div className="flex gap-2">
                  <Input
                    value={newObjective}
                    onChange={(e) => setNewObjective(e.target.value)}
                    placeholder="Add learning objective"
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        handleArrayAdd('learning_objectives', newObjective, setNewObjective);
                      }
                    }}
                  />
                  <Button
                    type="button"
                    onClick={() => handleArrayAdd('learning_objectives', newObjective, setNewObjective)}
                    size="sm"
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
                <div className="space-y-1">
                  {formData.learning_objectives.map((objective, index) => (
                    <div key={index} className="flex items-center justify-between bg-gray-50 p-2 rounded">
                      <span className="text-sm">{objective}</span>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => handleArrayRemove('learning_objectives', index)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div>
              <Label htmlFor="course_outline">Course Outline</Label>
              <Textarea
                id="course_outline"
                value={formData.course_outline}
                onChange={(e) => handleInputChange('course_outline', e.target.value)}
                placeholder="Detailed course outline and structure"
                className="mt-1"
                rows={6}
              />
            </div>

            <div>
              <Label>Prerequisites</Label>
              <div className="mt-2 space-y-2">
                <div className="flex gap-2">
                  <Input
                    value={newPrerequisite}
                    onChange={(e) => setNewPrerequisite(e.target.value)}
                    placeholder="Add prerequisite"
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        handleArrayAdd('prerequisites', newPrerequisite, setNewPrerequisite);
                      }
                    }}
                  />
                  <Button
                    type="button"
                    onClick={() => handleArrayAdd('prerequisites', newPrerequisite, setNewPrerequisite)}
                    size="sm"
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
                <div className="space-y-1">
                  {formData.prerequisites.map((prerequisite, index) => (
                    <div key={index} className="flex items-center justify-between bg-gray-50 p-2 rounded">
                      <span className="text-sm">{prerequisite}</span>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => handleArrayRemove('prerequisites', index)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        );

      case 4:
        return (
          <div className="space-y-6">
            <div>
              <Label htmlFor="assessment_criteria">Assessment Criteria</Label>
              <Textarea
                id="assessment_criteria"
                value={formData.assessment_criteria}
                onChange={(e) => handleInputChange('assessment_criteria', e.target.value)}
                placeholder="How will students be assessed?"
                className="mt-1"
                rows={4}
              />
            </div>

            <div>
              <Label htmlFor="certification_info">Certification Information</Label>
              <Textarea
                id="certification_info"
                value={formData.certification_info}
                onChange={(e) => handleInputChange('certification_info', e.target.value)}
                placeholder="What certification or credentials will students receive?"
                className="mt-1"
                rows={4}
              />
            </div>
          </div>
        );

      case 5:
        return (
          <div className="space-y-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label>Public Course</Label>
                  <p className="text-sm text-gray-500">Make this course visible to all users</p>
                </div>
                <Switch
                  checked={formData.is_public}
                  onCheckedChange={(checked) => handleInputChange('is_public', checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label>Requires Approval</Label>
                  <p className="text-sm text-gray-500">Students need instructor approval to enroll</p>
                </div>
                <Switch
                  checked={formData.requires_approval}
                  onCheckedChange={(checked) => handleInputChange('requires_approval', checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label>Allow Self-Enrollment</Label>
                  <p className="text-sm text-gray-500">Students can enroll themselves</p>
                </div>
                <Switch
                  checked={formData.allow_self_enrollment}
                  onCheckedChange={(checked) => handleInputChange('allow_self_enrollment', checked)}
                />
              </div>
            </div>

            <div>
              <Label>Tags</Label>
              <div className="mt-2 space-y-2">
                <div className="flex gap-2">
                  <Input
                    value={newTag}
                    onChange={(e) => setNewTag(e.target.value)}
                    placeholder="Add tag"
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        handleArrayAdd('tags', newTag, setNewTag);
                      }
                    }}
                  />
                  <Button
                    type="button"
                    onClick={() => handleArrayAdd('tags', newTag, setNewTag)}
                    size="sm"
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {formData.tags.map((tag, index) => (
                    <Badge key={index} variant="secondary" className="flex items-center gap-1">
                      {tag}
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => handleArrayRemove('tags', index)}
                        className="h-4 w-4 p-0"
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
          </div>
        );

      case 6:
        return (
          <div className="space-y-6">
            <div>
              <Label>Featured Image</Label>
              <div className="mt-2">
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) handleFileUpload('featured_image', file);
                  }}
                  className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                />
                {formData.featured_image && (
                  <div className="mt-2 flex items-center gap-2">
                    <ImageIcon className="h-4 w-4 text-gray-500" />
                    <span className="text-sm text-gray-700">{formData.featured_image.name}</span>
                  </div>
                )}
              </div>
            </div>

            <div>
              <Label>Course Materials</Label>
              <div className="mt-2">
                <input
                  type="file"
                  multiple
                  onChange={(e) => {
                    const files = Array.from(e.target.files || []);
                    files.forEach(file => handleFileUpload('course_materials', file));
                  }}
                  className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                />
                <div className="mt-2 space-y-1">
                  {formData.course_materials.map((file, index) => (
                    <div key={index} className="flex items-center gap-2 text-sm text-gray-700">
                      <FileText className="h-4 w-4" />
                      <span>{file.name}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <Navigation currentPath="/course-creation" />
      <div className="py-8">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Enhanced Header */}
          <div className="mb-12">
            <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-6">
                  <Link href="/course-management">
                    <Button variant="outline" size="lg" className="hover:bg-blue-50 hover:border-blue-200 transition-all duration-200">
                      <ArrowLeft className="h-5 w-5 mr-2" />
                      Back to Courses
                    </Button>
                  </Link>
                  <div className="flex items-center space-x-4">
                    <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg">
                      <BookOpen className="h-8 w-8 text-white" />
                    </div>
                    <div>
                      <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                        Create New Course
                      </h1>
                      <p className="text-lg text-gray-600 mt-2">Build a comprehensive course for your students</p>
                    </div>
                  </div>
                </div>
                <div className="flex space-x-3">
                  <Button variant="outline" size="lg" className="hover:bg-gray-50 transition-all duration-200">
                    <Eye className="h-5 w-5 mr-2" />
                    Preview
                  </Button>
                  <Button 
                    onClick={handleSubmit} 
                    disabled={isSubmitting}
                    size="lg"
                    className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                        Creating...
                      </>
                    ) : (
                      <>
                        <Save className="h-5 w-5 mr-2" />
                        Create Course
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </div>
          </div>

          {/* Enhanced Progress Steps */}
          <div className="mb-12">
            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8">
              <div className="flex items-center justify-between">
                {steps.map((step, index) => (
                  <div key={step.id} className="flex items-center flex-1">
                    <div className="flex flex-col items-center">
                      <div className={`relative flex items-center justify-center w-12 h-12 rounded-full text-sm font-bold transition-all duration-300 ${
                        currentStep >= step.id
                          ? 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-lg scale-110'
                          : currentStep === step.id
                          ? 'bg-gradient-to-r from-blue-400 to-indigo-500 text-white shadow-md scale-105'
                          : 'bg-gray-100 text-gray-400'
                      }`}>
                        {currentStep > step.id ? (
                          <CheckCircle className="h-6 w-6" />
                        ) : (
                          <span className="text-lg">{step.id}</span>
                        )}
                        {currentStep === step.id && (
                          <div className="absolute -inset-1 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full animate-pulse opacity-75"></div>
                        )}
                      </div>
                      <div className="mt-3 text-center">
                        <p className={`text-sm font-semibold ${
                          currentStep >= step.id ? 'text-gray-900' : 'text-gray-500'
                        }`}>
                          {step.title}
                        </p>
                        <p className="text-xs text-gray-500 mt-1 max-w-24">{step.description}</p>
                      </div>
                    </div>
                    {index < steps.length - 1 && (
                      <div className={`flex-1 h-1 mx-4 rounded-full transition-all duration-500 ${
                        currentStep > step.id 
                          ? 'bg-gradient-to-r from-blue-500 to-indigo-600' 
                          : 'bg-gray-200'
                      }`} />
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Enhanced Form Content */}
          <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 px-8 py-6 border-b border-gray-100">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center">
                    <span className="text-white font-bold text-lg">{currentStep}</span>
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900">{steps[currentStep - 1].title}</h2>
                    <p className="text-gray-600 mt-1">{steps[currentStep - 1].description}</p>
                  </div>
                </div>
                <Badge variant="secondary" className="bg-blue-100 text-blue-800 px-4 py-2 text-sm font-medium">
                  Step {currentStep} of {steps.length}
                </Badge>
              </div>
            </div>
            <div className="p-8">
              {renderStepContent()}
            </div>
          </div>

          {/* Enhanced Navigation Buttons */}
          <div className="mt-12">
            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
              <div className="flex items-center justify-between">
                <Button
                  variant="outline"
                  onClick={prevStep}
                  disabled={currentStep === 1}
                  size="lg"
                  className="h-12 px-8 border-2 border-gray-200 hover:border-gray-300 hover:bg-gray-50 transition-all duration-200 rounded-xl disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ArrowLeft className="h-5 w-5 mr-2" />
                  Previous
                </Button>
                
                <div className="flex items-center space-x-4">
                  <div className="text-sm text-gray-500">
                    Step {currentStep} of {steps.length}
                  </div>
                  <div className="w-32 bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-gradient-to-r from-blue-500 to-indigo-600 h-2 rounded-full transition-all duration-500"
                      style={{ width: `${(currentStep / steps.length) * 100}%` }}
                    ></div>
                  </div>
                </div>

                <div className="flex space-x-3">
                  {currentStep < steps.length ? (
                    <Button 
                      onClick={nextStep}
                      size="lg"
                      className="h-12 px-8 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105 rounded-xl"
                    >
                      Next Step
                      <ArrowLeft className="h-5 w-5 ml-2 rotate-180" />
                    </Button>
                  ) : (
                    <Button 
                      onClick={handleSubmit} 
                      disabled={isSubmitting}
                      size="lg"
                      className="h-12 px-8 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105 rounded-xl"
                    >
                      {isSubmitting ? (
                        <>
                          <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                          Creating Course...
                        </>
                      ) : (
                        <>
                          <Save className="h-5 w-5 mr-2" />
                          Create Course
                        </>
                      )}
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
