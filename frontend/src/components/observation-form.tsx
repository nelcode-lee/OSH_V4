"use client";

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  ClipboardList, 
  User, 
  Clock, 
  MapPin, 
  CheckCircle, 
  XCircle, 
  AlertTriangle,
  Star,
  FileText,
  Camera,
  Mic,
  Save,
  Send,
  Eye,
  Edit,
  Trash2,
  Plus,
  Minus,
  Target,
  Award,
  TrendingUp,
  Users,
  Calendar,
  Timer
} from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface ObservationCriteria {
  id: string;
  category: string;
  description: string;
  weight: number;
  required: boolean;
}

interface ObservationNote {
  id: string;
  timestamp: string;
  type: 'positive' | 'concern' | 'adaptation' | 'general';
  content: string;
  equipment_section?: string;
}

interface PerformanceRating {
  criteria_id: string;
  score: number; // 1-5 scale
  notes: string;
  evidence: string[];
}

interface ObservationFormProps {
  candidateId?: number;
  equipmentType?: string;
  onSave?: (observation: any) => void;
  onCancel?: () => void;
}

export default function ObservationForm({ 
  candidateId, 
  equipmentType = "Forward Tipping Dumper",
  onSave,
  onCancel 
}: ObservationFormProps) {
  const [observationData, setObservationData] = useState({
    candidate_name: '',
    candidate_id: candidateId || '',
    equipment_type: equipmentType,
    location: '',
    date: new Date().toISOString().split('T')[0],
    start_time: '',
    end_time: '',
    weather_conditions: 'Good',
    instructor_notes: '',
    overall_rating: 0,
    pass_fail: 'pending'
  });

  const [performanceRatings, setPerformanceRatings] = useState<PerformanceRating[]>([]);
  const [observationNotes, setObservationNotes] = useState<ObservationNote[]>([]);
  const [currentNote, setCurrentNote] = useState('');
  const [currentNoteType, setCurrentNoteType] = useState<'positive' | 'concern' | 'adaptation' | 'general'>('general');
  const [currentEquipmentSection, setCurrentEquipmentSection] = useState('');

  // Equipment-specific observation criteria
  const observationCriteria: ObservationCriteria[] = [
    // Safety & Preparation
    { id: 'safety_check', category: 'Safety & Preparation', description: 'Pre-use safety checks completed', weight: 10, required: true },
    { id: 'ppe_worn', category: 'Safety & Preparation', description: 'Correct PPE worn and fitted properly', weight: 8, required: true },
    { id: 'risk_assessment', category: 'Safety & Preparation', description: 'Risk assessment carried out', weight: 7, required: true },
    
    // Equipment Operation
    { id: 'startup_procedure', category: 'Equipment Operation', description: 'Correct startup procedure followed', weight: 8, required: true },
    { id: 'controls_operation', category: 'Equipment Operation', description: 'Controls operated smoothly and correctly', weight: 9, required: true },
    { id: 'maneuvering', category: 'Equipment Operation', description: 'Safe and efficient maneuvering', weight: 10, required: true },
    { id: 'load_handling', category: 'Equipment Operation', description: 'Safe load handling and tipping', weight: 12, required: true },
    
    // Site Awareness
    { id: 'site_awareness', category: 'Site Awareness', description: 'Aware of surroundings and other workers', weight: 9, required: true },
    { id: 'communication', category: 'Site Awareness', description: 'Clear communication with ground crew', weight: 6, required: false },
    { id: 'traffic_management', category: 'Site Awareness', description: 'Follows site traffic management rules', weight: 8, required: true },
    
    // Problem Solving
    { id: 'problem_solving', category: 'Problem Solving', description: 'Identifies and resolves issues independently', weight: 7, required: false },
    { id: 'adaptation', category: 'Problem Solving', description: 'Adapts to changing conditions', weight: 6, required: false },
    
    // Shutdown & Maintenance
    { id: 'shutdown_procedure', category: 'Shutdown & Maintenance', description: 'Correct shutdown procedure followed', weight: 6, required: true },
    { id: 'equipment_care', category: 'Shutdown & Maintenance', description: 'Equipment left in safe condition', weight: 5, required: true }
  ];

  const equipmentSections = [
    'Pre-Operation Checks',
    'Startup & Controls',
    'Maneuvering & Driving',
    'Load Operations',
    'Site Navigation',
    'Communication',
    'Problem Resolution',
    'Shutdown & Cleanup'
  ];

  const weatherConditions = [
    'Excellent', 'Good', 'Fair', 'Poor', 'Hazardous'
  ];

  useEffect(() => {
    // Initialize performance ratings
    const initialRatings = observationCriteria.map(criteria => ({
      criteria_id: criteria.id,
      score: 0,
      notes: '',
      evidence: []
    }));
    setPerformanceRatings(initialRatings);
  }, []);

  const handleInputChange = (field: string, value: any) => {
    setObservationData(prev => ({ ...prev, [field]: value }));
  };

  const handleRatingChange = (criteriaId: string, score: number) => {
    setPerformanceRatings(prev => 
      prev.map(rating => 
        rating.criteria_id === criteriaId 
          ? { ...rating, score }
          : rating
      )
    );
  };

  const handleRatingNotes = (criteriaId: string, notes: string) => {
    setPerformanceRatings(prev => 
      prev.map(rating => 
        rating.criteria_id === criteriaId 
          ? { ...rating, notes }
          : rating
      )
    );
  };

  const addObservationNote = () => {
    if (!currentNote.trim()) return;

    const newNote: ObservationNote = {
      id: Date.now().toString(),
      timestamp: new Date().toLocaleTimeString(),
      type: currentNoteType,
      content: currentNote,
      equipment_section: currentEquipmentSection
    };

    setObservationNotes(prev => [...prev, newNote]);
    setCurrentNote('');
  };

  const removeNote = (noteId: string) => {
    setObservationNotes(prev => prev.filter(note => note.id !== noteId));
  };

  const calculateOverallScore = () => {
    const totalWeight = observationCriteria.reduce((sum, criteria) => sum + criteria.weight, 0);
    const weightedScore = performanceRatings.reduce((sum, rating) => {
      const criteria = observationCriteria.find(c => c.id === rating.criteria_id);
      return sum + (rating.score * (criteria?.weight || 0));
    }, 0);
    
    return Math.round((weightedScore / totalWeight) * 100) / 100;
  };

  const getScoreColor = (score: number) => {
    if (score >= 4) return 'text-green-600';
    if (score >= 3) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getScoreBadgeColor = (score: number) => {
    if (score >= 4) return 'bg-green-100 text-green-800';
    if (score >= 3) return 'bg-yellow-100 text-yellow-800';
    return 'bg-red-100 text-red-800';
  };

  const getNoteIcon = (type: string) => {
    switch (type) {
      case 'positive': return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'concern': return <AlertTriangle className="h-4 w-4 text-red-600" />;
      case 'adaptation': return <Target className="h-4 w-4 text-blue-600" />;
      default: return <FileText className="h-4 w-4 text-gray-600" />;
    }
  };

  const overallScore = calculateOverallScore();
  const passFail = overallScore >= 3.5 ? 'PASS' : overallScore >= 2.5 ? 'CONDITIONAL' : 'FAIL';

  const handleSave = () => {
    const observation = {
      ...observationData,
      overall_rating: overallScore,
      pass_fail: passFail,
      performance_ratings: performanceRatings,
      observation_notes: observationNotes,
      total_criteria: observationCriteria.length,
      completed_criteria: performanceRatings.filter(r => r.score > 0).length,
      created_at: new Date().toISOString()
    };

    onSave?.(observation);
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
        <CardHeader>
          <CardTitle className="flex items-center text-xl">
            <ClipboardList className="h-6 w-6 mr-3 text-blue-600" />
            Equipment Observation Assessment
          </CardTitle>
          <p className="text-gray-600">
            Comprehensive observation and feedback for practical equipment testing
          </p>
        </CardHeader>
      </Card>

      {/* Basic Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <User className="h-5 w-5 mr-2" />
            Assessment Details
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="candidate_name">Candidate Name *</Label>
              <Input
                id="candidate_name"
                value={observationData.candidate_name}
                onChange={(e) => handleInputChange('candidate_name', e.target.value)}
                placeholder="Enter candidate name"
              />
            </div>
            <div>
              <Label htmlFor="equipment_type">Equipment Type *</Label>
              <Select
                value={observationData.equipment_type}
                onValueChange={(value) => handleInputChange('equipment_type', value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Forward Tipping Dumper">Forward Tipping Dumper</SelectItem>
                  <SelectItem value="Excavator">Excavator</SelectItem>
                  <SelectItem value="Roller">Roller</SelectItem>
                  <SelectItem value="Telehandler">Telehandler</SelectItem>
                  <SelectItem value="Wheeled Loading Shovel">Wheeled Loading Shovel</SelectItem>
                  <SelectItem value="Dozer">Dozer</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="location">Location *</Label>
              <Input
                id="location"
                value={observationData.location}
                onChange={(e) => handleInputChange('location', e.target.value)}
                placeholder="Site location"
              />
            </div>
            <div>
              <Label htmlFor="date">Date *</Label>
              <Input
                id="date"
                type="date"
                value={observationData.date}
                onChange={(e) => handleInputChange('date', e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="start_time">Start Time</Label>
              <Input
                id="start_time"
                type="time"
                value={observationData.start_time}
                onChange={(e) => handleInputChange('start_time', e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="weather_conditions">Weather Conditions</Label>
              <Select
                value={observationData.weather_conditions}
                onValueChange={(value) => handleInputChange('weather_conditions', value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {weatherConditions.map(condition => (
                    <SelectItem key={condition} value={condition}>{condition}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Performance Assessment */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span className="flex items-center">
              <Target className="h-5 w-5 mr-2" />
              Performance Assessment
            </span>
            <div className="flex items-center space-x-4">
              <Badge className={getScoreBadgeColor(overallScore)}>
                Overall: {overallScore.toFixed(1)}/5.0
              </Badge>
              <Badge variant={passFail === 'PASS' ? 'default' : passFail === 'CONDITIONAL' ? 'secondary' : 'destructive'}>
                {passFail}
              </Badge>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {observationCriteria.reduce((acc, criteria) => {
              const category = criteria.category;
              if (!acc[category]) acc[category] = [];
              acc[category].push(criteria);
              return acc;
            }, {} as Record<string, ObservationCriteria[]>).map(([category, criteriaList]) => (
              <div key={category} className="space-y-4">
                <h4 className="text-lg font-semibold text-gray-900 border-b pb-2">{category}</h4>
                <div className="space-y-3">
                  {criteriaList.map(criteria => {
                    const rating = performanceRatings.find(r => r.criteria_id === criteria.id);
                    return (
                      <div key={criteria.id} className="p-4 border rounded-lg hover:bg-gray-50">
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex-1">
                            <div className="flex items-center space-x-2">
                              <Label className="font-medium">{criteria.description}</Label>
                              {criteria.required && (
                                <Badge variant="destructive" className="text-xs">Required</Badge>
                              )}
                              <Badge variant="outline" className="text-xs">
                                Weight: {criteria.weight}
                              </Badge>
                            </div>
                          </div>
                          <div className="flex items-center space-x-2">
                            <span className="text-sm text-gray-500">Score:</span>
                            <div className="flex space-x-1">
                              {[1, 2, 3, 4, 5].map(score => (
                                <button
                                  key={score}
                                  onClick={() => handleRatingChange(criteria.id, score)}
                                  className={`w-8 h-8 rounded-full border-2 flex items-center justify-center text-sm font-medium transition-colors ${
                                    rating?.score === score
                                      ? 'border-blue-500 bg-blue-500 text-white'
                                      : 'border-gray-300 hover:border-gray-400'
                                  }`}
                                >
                                  {score}
                                </button>
                              ))}
                            </div>
                          </div>
                        </div>
                        <Textarea
                          placeholder="Add specific notes about performance in this area..."
                          value={rating?.notes || ''}
                          onChange={(e) => handleRatingNotes(criteria.id, e.target.value)}
                          className="mt-2"
                          rows={2}
                        />
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Observation Notes */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <FileText className="h-5 w-5 mr-2" />
            Real-Time Observation Notes
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Add Note Form */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-3 mb-3">
              <div>
                <Label>Note Type</Label>
                <Select value={currentNoteType} onValueChange={(value: any) => setCurrentNoteType(value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="positive">✅ Positive</SelectItem>
                    <SelectItem value="concern">⚠️ Concern</SelectItem>
                    <SelectItem value="adaptation">🎯 Adaptation</SelectItem>
                    <SelectItem value="general">📝 General</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Equipment Section</Label>
                <Select value={currentEquipmentSection} onValueChange={setCurrentEquipmentSection}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select section" />
                  </SelectTrigger>
                  <SelectContent>
                    {equipmentSections.map(section => (
                      <SelectItem key={section} value={section}>{section}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="md:col-span-2">
                <Label>Observation Note</Label>
                <div className="flex space-x-2">
                  <Input
                    value={currentNote}
                    onChange={(e) => setCurrentNote(e.target.value)}
                    placeholder="Add real-time observation..."
                    className="flex-1"
                  />
                  <Button onClick={addObservationNote} disabled={!currentNote.trim()}>
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          </div>

          {/* Notes List */}
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {observationNotes.map(note => (
              <div key={note.id} className="flex items-start space-x-3 p-3 bg-white border rounded-lg">
                <div className="flex-shrink-0 mt-1">
                  {getNoteIcon(note.type)}
                </div>
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-1">
                    <Badge variant="outline" className="text-xs">
                      {note.type.toUpperCase()}
                    </Badge>
                    {note.equipment_section && (
                      <Badge variant="secondary" className="text-xs">
                        {note.equipment_section}
                      </Badge>
                    )}
                    <span className="text-xs text-gray-500">{note.timestamp}</span>
                  </div>
                  <p className="text-sm text-gray-900">{note.content}</p>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => removeNote(note.id)}
                  className="text-red-600 hover:text-red-700"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Instructor Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Award className="h-5 w-5 mr-2" />
            Instructor Summary & Recommendations
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Textarea
            placeholder="Overall assessment summary, areas for improvement, recommended next steps, and any special adaptations needed..."
            value={observationData.instructor_notes}
            onChange={(e) => handleInputChange('instructor_notes', e.target.value)}
            rows={6}
            className="mb-4"
          />
          
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-600">
              <p>Assessment completed: {performanceRatings.filter(r => r.score > 0).length} / {observationCriteria.length} criteria</p>
              <p>Overall performance: {overallScore.toFixed(1)}/5.0 ({passFail})</p>
            </div>
            <div className="flex space-x-2">
              {onCancel && (
                <Button variant="outline" onClick={onCancel}>
                  Cancel
                </Button>
              )}
              <Button onClick={handleSave} className="bg-blue-600 hover:bg-blue-700">
                <Save className="h-4 w-4 mr-2" />
                Save Assessment
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
