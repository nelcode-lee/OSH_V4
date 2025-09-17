"use client";

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import Navigation from '@/components/navigation';
import ObservationForm from '@/components/observation-form';
import { 
  ClipboardList, 
  Search, 
  Filter, 
  Plus,
  Eye,
  Edit,
  Download,
  Calendar,
  User,
  MapPin,
  Clock,
  Target,
  Award,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  XCircle,
  FileText,
  BarChart3,
  Users,
  Equipment
} from 'lucide-react';
import { api, getAuthHeaders } from '@/lib/api';

interface Observation {
  id: number;
  candidate_name: string;
  candidate_id: number;
  equipment_type: string;
  location: string;
  date: string;
  start_time: string;
  end_time: string;
  weather_conditions: string;
  overall_rating: number;
  pass_fail: 'PASS' | 'CONDITIONAL' | 'FAIL' | 'pending';
  instructor_notes: string;
  performance_ratings: any[];
  observation_notes: any[];
  total_criteria: number;
  completed_criteria: number;
  created_at: string;
  instructor_name: string;
}

export default function ObservationsPage() {
  const [observations, setObservations] = useState<Observation[]>([]);
  const [loading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterEquipment, setFilterEquipment] = useState('all');
  const [showObservationForm, setShowObservationForm] = useState(false);
  const [selectedObservation, setSelectedObservation] = useState<Observation | null>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  useEffect(() => {
    loadObservations();
  }, []);

  const loadObservations = async () => {
    try {
      setIsLoading(true);
      // Mock data for now - replace with real API call
      const mockObservations: Observation[] = [
        {
          id: 1,
          candidate_name: "Ahmed Hassan",
          candidate_id: 101,
          equipment_type: "Forward Tipping Dumper",
          location: "Site A - Construction Zone",
          date: "2024-01-15",
          start_time: "09:00",
          end_time: "11:30",
          weather_conditions: "Good",
          overall_rating: 4.2,
          pass_fail: "PASS",
          instructor_notes: "Excellent performance with good safety awareness. Minor improvement needed in communication with ground crew.",
          performance_ratings: [],
          observation_notes: [],
          total_criteria: 14,
          completed_criteria: 14,
          created_at: "2024-01-15T10:30:00Z",
          instructor_name: "John Smith"
        },
        {
          id: 2,
          candidate_name: "Priya Patel",
          candidate_id: 102,
          equipment_type: "Excavator",
          location: "Site B - Excavation Area",
          date: "2024-01-14",
          start_time: "14:00",
          end_time: "16:45",
          weather_conditions: "Fair",
          overall_rating: 3.8,
          pass_fail: "PASS",
          instructor_notes: "Good technical skills but needs more confidence in decision making. Recommended additional practice sessions.",
          performance_ratings: [],
          observation_notes: [],
          total_criteria: 14,
          completed_criteria: 14,
          created_at: "2024-01-14T15:30:00Z",
          instructor_name: "Sarah Johnson"
        },
        {
          id: 3,
          candidate_name: "Michael O'Brien",
          candidate_id: 103,
          equipment_type: "Forward Tipping Dumper",
          location: "Site C - Loading Bay",
          date: "2024-01-13",
          start_time: "08:30",
          end_time: "10:15",
          weather_conditions: "Poor",
          overall_rating: 2.9,
          pass_fail: "CONDITIONAL",
          instructor_notes: "Struggled with load handling in wet conditions. Needs additional training on weather adaptation and load distribution.",
          performance_ratings: [],
          observation_notes: [],
          total_criteria: 14,
          completed_criteria: 12,
          created_at: "2024-01-13T09:30:00Z",
          instructor_name: "John Smith"
        },
        {
          id: 4,
          candidate_name: "Maria Rodriguez",
          candidate_id: 104,
          equipment_type: "Telehandler",
          location: "Site A - Warehouse",
          date: "2024-01-12",
          start_time: "11:00",
          end_time: "13:30",
          weather_conditions: "Excellent",
          overall_rating: 4.6,
          pass_fail: "PASS",
          instructor_notes: "Outstanding performance with excellent spatial awareness and load management. Ready for advanced operations.",
          performance_ratings: [],
          observation_notes: [],
          total_criteria: 14,
          completed_criteria: 14,
          created_at: "2024-01-12T12:30:00Z",
          instructor_name: "Sarah Johnson"
        }
      ];
      
      setObservations(mockObservations);
    } catch (error) {
      console.error('Error loading observations:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    loadObservations();
  };

  const handleSaveObservation = (observation: any) => {
    console.log('Saving observation:', observation);
    // Add to observations list
    const newObservation: Observation = {
      ...observation,
      id: Date.now(),
      instructor_name: "Current Instructor", // Get from auth context
      created_at: new Date().toISOString()
    };
    
    setObservations(prev => [newObservation, ...prev]);
    setShowObservationForm(false);
    setSelectedObservation(null);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PASS': return 'bg-green-100 text-green-800';
      case 'CONDITIONAL': return 'bg-yellow-100 text-yellow-800';
      case 'FAIL': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'PASS': return <CheckCircle className="h-4 w-4" />;
      case 'CONDITIONAL': return <AlertTriangle className="h-4 w-4" />;
      case 'FAIL': return <XCircle className="h-4 w-4" />;
      default: return <Clock className="h-4 w-4" />;
    }
  };

  const getEquipmentIcon = (equipment: string) => {
    return <Equipment className="h-5 w-5 text-blue-600" />;
  };

  const filteredObservations = observations.filter(obs => {
    const matchesSearch = !searchQuery ||
      obs.candidate_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      obs.equipment_type.toLowerCase().includes(searchQuery.toLowerCase()) ||
      obs.location.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus = filterStatus === 'all' || obs.pass_fail.toLowerCase() === filterStatus;
    const matchesEquipment = filterEquipment === 'all' || obs.equipment_type === filterEquipment;

    return matchesSearch && matchesStatus && matchesEquipment;
  });

  const equipmentTypes = [...new Set(observations.map(obs => obs.equipment_type))];

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation currentPath="/observations" />
      
      <div className="py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Equipment Observations</h1>
                <p className="text-gray-600 mt-2">
                  Track and manage practical equipment assessments and candidate feedback
                </p>
              </div>
              <div className="flex space-x-3">
                <Button
                  onClick={() => setShowObservationForm(true)}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  New Observation
                </Button>
                <Button variant="outline">
                  <Download className="h-4 w-4 mr-2" />
                  Export
                </Button>
              </div>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <ClipboardList className="h-6 w-6 text-blue-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Total Observations</p>
                    <p className="text-2xl font-bold text-gray-900">{observations.length}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <CheckCircle className="h-6 w-6 text-green-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Passed</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {observations.filter(obs => obs.pass_fail === 'PASS').length}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <div className="p-2 bg-yellow-100 rounded-lg">
                    <AlertTriangle className="h-6 w-6 text-yellow-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Conditional</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {observations.filter(obs => obs.pass_fail === 'CONDITIONAL').length}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <div className="p-2 bg-purple-100 rounded-lg">
                    <TrendingUp className="h-6 w-6 text-purple-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Avg. Rating</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {observations.length > 0 
                        ? (observations.reduce((sum, obs) => sum + obs.overall_rating, 0) / observations.length).toFixed(1)
                        : '0.0'
                      }
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Search and Filters */}
          <Card className="mb-6">
            <CardContent className="p-6">
              <div className="flex flex-col lg:flex-row lg:items-center space-y-4 lg:space-y-0 lg:space-x-4">
                <form onSubmit={handleSearch} className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                    <Input
                      placeholder="Search observations..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </form>
                
                <div className="flex items-center space-x-4">
                  <select
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                    className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="all">All Status</option>
                    <option value="pass">Passed</option>
                    <option value="conditional">Conditional</option>
                    <option value="fail">Failed</option>
                    <option value="pending">Pending</option>
                  </select>
                  
                  <select
                    value={filterEquipment}
                    onChange={(e) => setFilterEquipment(e.target.value)}
                    className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="all">All Equipment</option>
                    {equipmentTypes.map(type => (
                      <option key={type} value={type}>{type}</option>
                    ))}
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
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Observations List */}
          {loading ? (
            <Card>
              <CardContent className="text-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                <p className="text-gray-600">Loading observations...</p>
              </CardContent>
            </Card>
          ) : filteredObservations.length === 0 ? (
            <Card>
              <CardContent className="text-center py-12">
                <ClipboardList className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No observations found</h3>
                <p className="text-gray-600 mb-4">
                  {searchQuery || filterStatus !== 'all' || filterEquipment !== 'all'
                    ? 'Try adjusting your search or filter criteria.'
                    : 'No observations have been recorded yet.'
                  }
                </p>
                <Button onClick={() => setShowObservationForm(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Create First Observation
                </Button>
              </CardContent>
            </Card>
          ) : viewMode === 'grid' ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredObservations.map(observation => (
                <Card key={observation.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center space-x-2">
                        {getEquipmentIcon(observation.equipment_type)}
                        <div>
                          <CardTitle className="text-lg">{observation.candidate_name}</CardTitle>
                          <p className="text-sm text-gray-600">{observation.equipment_type}</p>
                        </div>
                      </div>
                      <Badge className={getStatusColor(observation.pass_fail)}>
                        <div className="flex items-center space-x-1">
                          {getStatusIcon(observation.pass_fail)}
                          <span>{observation.pass_fail}</span>
                        </div>
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <div className="flex items-center text-sm text-gray-600">
                        <MapPin className="h-4 w-4 mr-2" />
                        {observation.location}
                      </div>
                      <div className="flex items-center text-sm text-gray-600">
                        <Calendar className="h-4 w-4 mr-2" />
                        {new Date(observation.date).toLocaleDateString()}
                      </div>
                      <div className="flex items-center text-sm text-gray-600">
                        <Clock className="h-4 w-4 mr-2" />
                        {observation.start_time} - {observation.end_time}
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">Overall Rating</span>
                        <span className="text-lg font-bold text-blue-600">
                          {observation.overall_rating.toFixed(1)}/5.0
                        </span>
                      </div>
                      <Progress 
                        value={(observation.overall_rating / 5) * 100} 
                        className="h-2"
                      />
                    </div>

                    <div className="text-sm text-gray-600">
                      <p className="line-clamp-2">{observation.instructor_notes}</p>
                    </div>

                    <div className="flex items-center justify-between pt-2">
                      <div className="text-xs text-gray-500">
                        {observation.completed_criteria}/{observation.total_criteria} criteria
                      </div>
                      <div className="flex space-x-1">
                        <Button size="sm" variant="outline">
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button size="sm" variant="outline">
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button size="sm" variant="outline">
                          <Download className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50 border-b">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Candidate
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Equipment
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Location
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Date
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Rating
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Status
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {filteredObservations.map(observation => (
                        <tr key={observation.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                                <User className="h-5 w-5 text-blue-600" />
                              </div>
                              <div>
                                <div className="text-sm font-medium text-gray-900">
                                  {observation.candidate_name}
                                </div>
                                <div className="text-sm text-gray-500">
                                  ID: {observation.candidate_id}
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              {getEquipmentIcon(observation.equipment_type)}
                              <span className="ml-2 text-sm text-gray-900">
                                {observation.equipment_type}
                              </span>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {observation.location}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {new Date(observation.date).toLocaleDateString()}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <span className="text-sm font-medium text-gray-900 mr-2">
                                {observation.overall_rating.toFixed(1)}
                              </span>
                              <div className="w-16 bg-gray-200 rounded-full h-2">
                                <div 
                                  className="bg-blue-600 h-2 rounded-full" 
                                  style={{ width: `${(observation.overall_rating / 5) * 100}%` }}
                                ></div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <Badge className={getStatusColor(observation.pass_fail)}>
                              <div className="flex items-center space-x-1">
                                {getStatusIcon(observation.pass_fail)}
                                <span>{observation.pass_fail}</span>
                              </div>
                            </Badge>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <div className="flex space-x-2">
                              <Button size="sm" variant="outline">
                                <Eye className="h-4 w-4" />
                              </Button>
                              <Button size="sm" variant="outline">
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button size="sm" variant="outline">
                                <Download className="h-4 w-4" />
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
        </div>
      </div>

      {/* Observation Form Modal */}
      {showObservationForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-6xl w-full max-h-[90vh] overflow-y-auto">
            <ObservationForm
              onSave={handleSaveObservation}
              onCancel={() => setShowObservationForm(false)}
            />
          </div>
        </div>
      )}
    </div>
  );
}
