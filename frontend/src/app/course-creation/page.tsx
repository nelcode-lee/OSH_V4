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
          <div className="space-y-6">
            <div>
              <Label htmlFor="title">Course Title *</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => handleInputChange('title', e.target.value)}
                placeholder="Enter course title"
                className="mt-1"
              />
            </div>

            <div>
              <Label htmlFor="short_description">Short Description *</Label>
              <Textarea
                id="short_description"
                value={formData.short_description}
                onChange={(e) => handleInputChange('short_description', e.target.value)}
                placeholder="Brief description (1-2 sentences)"
                className="mt-1"
                rows={2}
              />
            </div>

            <div>
              <Label htmlFor="description">Full Description *</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                placeholder="Detailed course description"
                className="mt-1"
                rows={4}
              />
            </div>

            <div>
              <Label htmlFor="category">Category *</Label>
              <Select
                value={formData.category}
                onValueChange={(value) => handleInputChange('category', value)}
              >
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((category) => (
                    <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <Label htmlFor="duration_hours">Duration (Hours) *</Label>
                <Input
                  id="duration_hours"
                  type="number"
                  value={formData.duration_hours}
                  onChange={(e) => handleInputChange('duration_hours', parseInt(e.target.value))}
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="max_students">Maximum Students</Label>
                <Input
                  id="max_students"
                  type="number"
                  value={formData.max_students}
                  onChange={(e) => handleInputChange('max_students', parseInt(e.target.value))}
                  className="mt-1"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="difficulty_level">Difficulty Level *</Label>
              <Select
                value={formData.difficulty_level}
                onValueChange={(value) => handleInputChange('difficulty_level', value)}
              >
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {difficultyLevels.map((level) => (
                    <SelectItem key={level.value} value={level.value}>
                      <div>
                        <div className="font-medium">{level.label}</div>
                        <div className="text-sm text-gray-500">{level.description}</div>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <Label htmlFor="start_date">Start Date</Label>
                <Input
                  id="start_date"
                  type="date"
                  value={formData.start_date}
                  onChange={(e) => handleInputChange('start_date', e.target.value)}
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="end_date">End Date</Label>
                <Input
                  id="end_date"
                  type="date"
                  value={formData.end_date}
                  onChange={(e) => handleInputChange('end_date', e.target.value)}
                  className="mt-1"
                />
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
    <div className="min-h-screen bg-gray-50">
      <Navigation currentPath="/course-creation" />
      <div className="py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <Link href="/course-management">
                  <Button variant="outline" size="sm">
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Back to Courses
                  </Button>
                </Link>
                <div>
                  <h1 className="text-3xl font-bold text-gray-900">Create New Course</h1>
                  <p className="text-gray-600">Build a comprehensive course for your students</p>
                </div>
              </div>
              <div className="flex space-x-2">
                <Button variant="outline">
                  <Eye className="h-4 w-4 mr-2" />
                  Preview
                </Button>
                <Button onClick={handleSubmit} disabled={isSubmitting}>
                  {isSubmitting ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Creating...
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4 mr-2" />
                      Create Course
                    </>
                  )}
                </Button>
              </div>
            </div>
          </div>

          {/* Progress Steps */}
          <div className="mb-8">
            <div className="flex items-center justify-between">
              {steps.map((step, index) => (
                <div key={step.id} className="flex items-center">
                  <div className={`flex items-center justify-center w-8 h-8 rounded-full text-sm font-medium ${
                    currentStep >= step.id
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-200 text-gray-600'
                  }`}>
                    {currentStep > step.id ? (
                      <CheckCircle className="h-4 w-4" />
                    ) : (
                      step.id
                    )}
                  </div>
                  <div className="ml-3">
                    <p className={`text-sm font-medium ${
                      currentStep >= step.id ? 'text-blue-600' : 'text-gray-500'
                    }`}>
                      {step.title}
                    </p>
                    <p className="text-xs text-gray-500">{step.description}</p>
                  </div>
                  {index < steps.length - 1 && (
                    <div className={`w-16 h-0.5 mx-4 ${
                      currentStep > step.id ? 'bg-blue-600' : 'bg-gray-200'
                    }`} />
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Form Content */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                {steps[currentStep - 1].title}
                <Badge variant="outline" className="ml-2">
                  Step {currentStep} of {steps.length}
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {renderStepContent()}
            </CardContent>
          </Card>

          {/* Navigation Buttons */}
          <div className="flex justify-between mt-8">
            <Button
              variant="outline"
              onClick={prevStep}
              disabled={currentStep === 1}
            >
              Previous
            </Button>
            <div className="flex space-x-2">
              {currentStep < steps.length ? (
                <Button onClick={nextStep}>
                  Next Step
                </Button>
              ) : (
                <Button onClick={handleSubmit} disabled={isSubmitting}>
                  {isSubmitting ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Creating Course...
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4 mr-2" />
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
  );
}
