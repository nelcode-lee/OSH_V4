"use client";

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Loader2, Sparkles, FileText, BookOpen, ClipboardList, BarChart3, ArrowLeft, Database, ToggleLeft, ToggleRight } from 'lucide-react';
import Link from 'next/link';
import { api } from '@/lib/api';

export default function AIContentBuilderPage() {
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedContent, setGeneratedContent] = useState<any>(null);
  const [formData, setFormData] = useState({
    content_type: 'learning_material',
    title: '',
    description: '',
    additional_instructions: '',
    difficulty_level: 'intermediate',
    target_audience: 'Construction workers and safety professionals',
    use_rag: true
  });

  const contentTypes = [
    { value: 'learning_material', label: 'Learning Material', icon: BookOpen, description: 'Educational content and study materials' },
    { value: 'lesson_plan', label: 'Lesson Plan', icon: FileText, description: 'Structured lesson plans with activities' },
    { value: 'test', label: 'Test/Assessment', icon: ClipboardList, description: 'Knowledge tests and assessments' },
    { value: 'assessment', label: 'Assessment Rubric', icon: BarChart3, description: 'Grading rubrics and evaluation criteria' }
  ];

  const handleGenerate = async () => {
    if (!formData.title.trim()) {
      alert('Please enter a title');
      return;
    }

    setIsGenerating(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${api.baseUrl}/api/ai/generate-content`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          ...formData,
          use_rag: formData.use_rag
        })
      });

      const result = await response.json();
      if (result.success) {
        setGeneratedContent(result.content);
      } else {
        alert('Content generation failed: ' + (result.error || 'Unknown error'));
      }
    } catch (error) {
      console.error('Error generating content:', error);
      alert('Error generating content');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSaveContent = async () => {
    if (!generatedContent) return;

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${api.baseUrl}/api/courses/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          title: generatedContent.title,
          description: generatedContent.content.substring(0, 200) + '...',
          content_type: generatedContent.type,
          content: generatedContent.content,
          metadata: generatedContent.metadata
        })
      });

      if (response.ok) {
        alert('Content saved successfully!');
        setGeneratedContent(null);
        setFormData({
          content_type: 'learning_material',
          title: '',
          description: '',
          additional_instructions: '',
          difficulty_level: 'intermediate',
          target_audience: 'Construction workers and safety professionals',
          use_rag: true
        });
      } else {
        alert('Failed to save content');
      }
    } catch (error) {
      console.error('Error saving content:', error);
      alert('Error saving content');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto p-6">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-4">
            <Link href="/instructors">
              <Button variant="outline" size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Dashboard
              </Button>
            </Link>
            <div>
              <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
                <Sparkles className="h-8 w-8 text-blue-600" />
                AI Content Builder
              </h1>
              <p className="text-gray-600 mt-2">Generate educational content using AI</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Content Generation Form */}
          <Card>
            <CardHeader>
              <CardTitle>Generate Content</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Content Type Selection */}
              <div>
                <Label className="text-base font-medium">Content Type</Label>
                <div className="grid grid-cols-2 gap-3 mt-2">
                  {contentTypes.map((type) => {
                    const Icon = type.icon;
                    return (
                      <div
                        key={type.value}
                        className={`p-4 border rounded-lg cursor-pointer transition-all ${
                          formData.content_type === type.value
                            ? 'border-blue-500 bg-blue-50'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                        onClick={() => setFormData({ ...formData, content_type: type.value })}
                      >
                        <div className="flex items-center gap-3">
                          <Icon className="h-5 w-5 text-gray-600" />
                          <div>
                            <div className="font-medium text-sm">{type.label}</div>
                            <div className="text-xs text-gray-500">{type.description}</div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Title Input */}
              <div>
                <Label htmlFor="title">Title *</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="Enter content title"
                  className="mt-1"
                />
              </div>

              {/* Description Input */}
              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Describe what this content should cover"
                  className="mt-1"
                  rows={3}
                />
              </div>

              {/* Additional Instructions */}
              <div>
                <Label htmlFor="instructions">Additional Instructions</Label>
                <Textarea
                  id="instructions"
                  value={formData.additional_instructions}
                  onChange={(e) => setFormData({ ...formData, additional_instructions: e.target.value })}
                  placeholder="Any specific requirements or focus areas"
                  className="mt-1"
                  rows={2}
                />
              </div>

              {/* Difficulty Level */}
              <div>
                <Label htmlFor="difficulty">Difficulty Level</Label>
                <Select
                  value={formData.difficulty_level}
                  onValueChange={(value) => setFormData({ ...formData, difficulty_level: value })}
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="beginner">Beginner</SelectItem>
                    <SelectItem value="intermediate">Intermediate</SelectItem>
                    <SelectItem value="advanced">Advanced</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Target Audience */}
              <div>
                <Label htmlFor="audience">Target Audience</Label>
                <Input
                  id="audience"
                  value={formData.target_audience}
                  onChange={(e) => setFormData({ ...formData, target_audience: e.target.value })}
                  placeholder="Who is this content for?"
                  className="mt-1"
                />
              </div>

              {/* RAG Toggle */}
              <div className="flex items-center justify-between p-4 border rounded-lg bg-blue-50">
                <div className="flex items-center gap-3">
                  <Database className="h-5 w-5 text-blue-600" />
                  <div>
                    <Label className="text-base font-medium text-blue-900">Use RAG (Retrieval-Augmented Generation)</Label>
                    <p className="text-sm text-blue-700">Generate content using existing course documents and materials</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, use_rag: !formData.use_rag })}
                  className="flex items-center gap-2"
                >
                  {formData.use_rag ? (
                    <ToggleRight className="h-6 w-6 text-blue-600" />
                  ) : (
                    <ToggleLeft className="h-6 w-6 text-gray-400" />
                  )}
                </button>
              </div>

              {/* Generate Button */}
              <Button
                onClick={handleGenerate}
                disabled={isGenerating || !formData.title.trim()}
                className="w-full"
                size="lg"
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Generating Content...
                  </>
                ) : (
                  <>
                    <Sparkles className="h-4 w-4 mr-2" />
                    Generate Content
                  </>
                )}
              </Button>
            </CardContent>
          </Card>

          {/* Generated Content Preview */}
          <Card>
            <CardHeader>
              <CardTitle>Generated Content</CardTitle>
            </CardHeader>
            <CardContent>
              {generatedContent ? (
                <div className="space-y-4">
                  {/* Content Metadata */}
                  <div className="flex flex-wrap gap-2">
                    <Badge variant="secondary">{generatedContent.type.replace('_', ' ')}</Badge>
                    <Badge variant="outline">{generatedContent.metadata.difficulty_level}</Badge>
                    <Badge variant="outline">{generatedContent.metadata.word_count} words</Badge>
                    <Badge variant="outline">{generatedContent.metadata.estimated_read_time} min read</Badge>
                  </div>

                  {/* Content Preview */}
                  <div className="border rounded-lg p-4 bg-gray-50 max-h-96 overflow-y-auto">
                    <h3 className="text-lg font-semibold mb-3">{generatedContent.title}</h3>
                    <div className="prose prose-sm max-w-none">
                      <pre className="whitespace-pre-wrap text-sm text-gray-700">
                        {generatedContent.content}
                      </pre>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-2">
                    <Button onClick={handleSaveContent} className="flex-1">
                      Save Content
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => setGeneratedContent(null)}
                    >
                      Generate New
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="text-center py-12 text-gray-500">
                  <Sparkles className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                  <p>Generated content will appear here</p>
                  <p className="text-sm">Fill out the form and click "Generate Content"</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
