import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import {
  FiArrowLeft,
  FiMapPin,
  FiUsers,
  FiZap,
  FiTrendingUp,
  FiEye,
  FiDownload,
  FiFilter,
  FiSearch,
  FiStar,
  FiCalendar,
  FiAward,
  FiBookOpen,
  FiGlobe
} from 'react-icons/fi';
import { collegesAPI, usersAPI, ideasAPI } from '../../services/api';
import { toast } from 'react-hot-toast';

const AreaDetail = () => {
  const { areaName } = useParams();
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);
  const [area, setArea] = useState(null);
  const [colleges, setColleges] = useState([]);
  const [filteredColleges, setFilteredColleges] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('successRate');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAreaData();
  }, [areaName]);

  const fetchAreaData = async () => {
    try {
      setLoading(true);
      
      // Fetch colleges in this area
      const collegesResponse = await collegesAPI.getAll({
        city: areaName,
        limit: 1000
      });

      if (collegesResponse.data?.data?.colleges) {
        const fetchedColleges = collegesResponse.data.data.colleges;
        
        // Fetch additional data for each college
        const collegesWithDetails = await Promise.all(
          fetchedColleges.map(async (college) => {
            try {
              // Fetch students count
              const studentsResponse = await usersAPI.getStudents({
                college_id: college.id,
                limit: 1
              });
              
              // Fetch ideas count
              const ideasResponse = await ideasAPI.getAll({
                college_id: college.id,
                limit: 1
              });

              const studentsCount = studentsResponse.data?.data?.total || 0;
              const ideasCount = ideasResponse.data?.data?.total || 0;
              
              return {
                id: college.id,
                name: college.name,
                fullName: college.name,
                established: college.established_year,
                totalStudents: studentsCount,
                totalIdeas: ideasCount,
                pendingIdeas: 0, // This would need a separate API call
                endorsedIdeas: 0, // This would need a separate API call
                acceptedIdeas: 0, // This would need a separate API call
                successRate: college.success_rate || 0,
                avgRating: college.rating || 0,
                departments: college.departments || [],
                recentAchievements: college.achievements || []
              };
            } catch (error) {
              console.error(`Error fetching details for college ${college.id}:`, error);
              return {
                id: college.id,
                name: college.name,
                fullName: college.name,
                established: college.established_year,
                totalStudents: 0,
                totalIdeas: 0,
                pendingIdeas: 0,
                endorsedIdeas: 0,
                acceptedIdeas: 0,
                successRate: 0,
                avgRating: 0,
                departments: college.departments || [],
                recentAchievements: college.achievements || []
              };
            }
          })
        );

        setColleges(collegesWithDetails);
        setFilteredColleges(collegesWithDetails);

        // Calculate area statistics
        const totalStudents = collegesWithDetails.reduce((sum, college) => sum + college.totalStudents, 0);
        const totalIdeas = collegesWithDetails.reduce((sum, college) => sum + college.totalIdeas, 0);
        const avgSuccessRate = collegesWithDetails.length > 0 
          ? collegesWithDetails.reduce((sum, college) => sum + college.successRate, 0) / collegesWithDetails.length 
          : 0;
        const avgRating = collegesWithDetails.length > 0 
          ? collegesWithDetails.reduce((sum, college) => sum + college.avgRating, 0) / collegesWithDetails.length 
          : 0;

        setArea({
          name: areaName,
          fullName: `${areaName} District`,
        state: 'Maharashtra',
          totalColleges: collegesWithDetails.length,
          totalStudents,
          totalIdeas,
          avgSuccessRate: Math.round(avgSuccessRate),
          avgRating: Math.round(avgRating * 10) / 10,
          establishedYear: 1956, // This would come from area data
          description: `${areaName} is a major educational hub in Maharashtra, known for its prestigious institutions and innovation ecosystem.`,
        keyHighlights: [
          'Highest concentration of engineering colleges in the region',
          'Leading in technology and innovation initiatives',
          'Strong industry-academia partnerships',
          'Government support for startup ecosystem'
          ]
        });
      } else {
        setColleges([]);
        setFilteredColleges([]);
        setArea({
          name: areaName,
          fullName: `${areaName} District`,
        state: 'Maharashtra',
          totalColleges: 0,
          totalStudents: 0,
          totalIdeas: 0,
          avgSuccessRate: 0,
          avgRating: 0,
          establishedYear: 1956,
          description: `${areaName} is an emerging educational center with focus on innovation and sustainable development.`,
          keyHighlights: []
        });
      }

    } catch (error) {
      console.error('Error fetching area data:', error);
      toast.error('Failed to load area details');
      setArea({
        name: areaName,
        fullName: `${areaName} District`,
        state: 'Maharashtra',
        totalColleges: 0,
        totalStudents: 0,
        totalIdeas: 0,
        avgSuccessRate: 0,
        avgRating: 0,
        establishedYear: 1956,
        description: `${areaName} is an emerging educational center with focus on innovation and sustainable development.`,
        keyHighlights: []
      });
      setColleges([]);
      setFilteredColleges([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let filtered = colleges;

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(college =>
        college.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        college.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        college.departments.some(dept => dept.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    // Sort colleges
    filtered = [...filtered].sort((a, b) => {
      switch (sortBy) {
        case 'successRate':
          return b.successRate - a.successRate;
        case 'totalIdeas':
          return b.totalIdeas - a.totalIdeas;
        case 'totalStudents':
          return b.totalStudents - a.totalStudents;
        case 'avgRating':
          return b.avgRating - a.avgRating;
        case 'name':
          return a.name.localeCompare(b.name);
        default:
          return b.successRate - a.successRate;
      }
    });

    setFilteredColleges(filtered);
  }, [colleges, searchTerm, sortBy]);

  const exportAreaData = () => {
    const csvContent = [
      ['College Name', 'Students', 'Ideas', 'Endorsed', 'Accepted', 'Success Rate', 'Rating'],
      ...filteredColleges.map(college => [
        college.name,
        college.totalStudents,
        college.totalIdeas,
        college.endorsedIdeas,
        college.acceptedIdeas,
        `${college.successRate}%`,
        college.avgRating
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${area.name}_colleges_performance.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (!area) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold text-secondary-900 dark:text-white mb-4">
          Area Not Found
        </h2>
        <p className="text-secondary-600 dark:text-secondary-400 mb-6">
          The area you're looking for doesn't exist or has been removed.
        </p>
        <button
          onClick={() => navigate(-1)}
          className="btn-primary"
        >
          Go Back
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center space-x-4">
        <button
          onClick={() => navigate(-1)}
          className="p-2 text-secondary-600 hover:text-secondary-900 dark:text-secondary-400 dark:hover:text-white rounded-lg hover:bg-secondary-100 dark:hover:bg-secondary-800 transition-colors duration-200"
        >
          <FiArrowLeft size={20} />
        </button>
        <div className="flex-1">
          <h1 className="text-3xl font-bold text-secondary-900 dark:text-white">
            {area.name} Region
          </h1>
          <p className="text-secondary-600 dark:text-secondary-400">
            {area.fullName} • {area.state}
          </p>
        </div>
        <button
          onClick={exportAreaData}
          className="btn-outline"
        >
          <FiDownload className="mr-2" size={16} />
          Export Data
        </button>
      </div>

      {/* Area Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Area Information */}
        <div className="lg:col-span-1">
          <div className="card p-6">
            <div className="flex items-center space-x-4 mb-6">
              <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center text-white font-bold text-2xl">
                <FiMapPin size={32} />
              </div>
              <div>
                <h3 className="text-xl font-semibold text-secondary-900 dark:text-white">
                  {area.name}
                </h3>
                <p className="text-secondary-600 dark:text-secondary-400">
                  Est. {area.establishedYear}
                </p>
              </div>
            </div>

            <p className="text-secondary-700 dark:text-secondary-300 mb-6">
              {area.description}
            </p>

            <div className="space-y-4">
              <h4 className="font-semibold text-secondary-900 dark:text-white">
                Key Highlights
              </h4>
              <ul className="space-y-2">
                {area.keyHighlights.map((highlight, index) => (
                  <li key={index} className="flex items-start space-x-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                    <span className="text-sm text-secondary-600 dark:text-secondary-400">
                      {highlight}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* Area Statistics */}
        <div className="lg:col-span-2">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="card p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-secondary-600 dark:text-secondary-400">
                    Colleges
                  </p>
                  <p className="text-2xl font-bold text-secondary-900 dark:text-white">
                    {area.totalColleges}
                  </p>
                </div>
                <div className="p-2 bg-blue-100 dark:bg-blue-900/20 rounded-lg">
                  <FiMapPin className="text-blue-600 dark:text-blue-400" size={20} />
                </div>
              </div>
            </div>

            <div className="card p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-secondary-600 dark:text-secondary-400">
                    Students
                  </p>
                  <p className="text-2xl font-bold text-secondary-900 dark:text-white">
                    {area.totalStudents}
                  </p>
                </div>
                <div className="p-2 bg-green-100 dark:bg-green-900/20 rounded-lg">
                  <FiUsers className="text-green-600 dark:text-green-400" size={20} />
                </div>
              </div>
            </div>

            <div className="card p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-secondary-600 dark:text-secondary-400">
                    Total Ideas
                  </p>
                  <p className="text-2xl font-bold text-secondary-900 dark:text-white">
                    {area.totalIdeas}
                  </p>
                </div>
                <div className="p-2 bg-primary-100 dark:bg-primary-900/20 rounded-lg">
                  <FiZap className="text-primary-600 dark:text-primary-400" size={20} />
                </div>
              </div>
            </div>

            <div className="card p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-secondary-600 dark:text-secondary-400">
                    Avg Success Rate
                  </p>
                  <p className="text-2xl font-bold text-secondary-900 dark:text-white">
                    {area.avgSuccessRate}%
                  </p>
                </div>
                <div className="p-2 bg-yellow-100 dark:bg-yellow-900/20 rounded-lg">
                  <FiTrendingUp className="text-yellow-600 dark:text-yellow-400" size={20} />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Colleges in Area */}
      <div className="card">
        <div className="p-6 border-b border-secondary-200 dark:border-secondary-700">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <h2 className="text-lg font-semibold text-secondary-900 dark:text-white">
              Colleges in {area.name} ({filteredColleges.length})
            </h2>
          </div>
        </div>

        {/* Filters and Search */}
        <div className="p-6 border-b border-secondary-200 dark:border-secondary-700">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Search */}
            <div className="md:col-span-2">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FiSearch className="h-5 w-5 text-secondary-400" />
                </div>
                <input
                  type="text"
                  placeholder="Search colleges..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="input-field pl-10"
                />
              </div>
            </div>

            {/* Sort */}
            <div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FiFilter className="h-5 w-5 text-secondary-400" />
                </div>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="input-field pl-10"
                >
                  <option value="successRate">Success Rate</option>
                  <option value="totalIdeas">Total Ideas</option>
                  <option value="totalStudents">Total Students</option>
                  <option value="avgRating">Average Rating</option>
                  <option value="name">College Name</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Colleges List */}
        <div className="p-6">
          {filteredColleges.length === 0 ? (
            <div className="text-center py-12">
              <FiMapPin className="mx-auto text-secondary-400 mb-4" size={48} />
              <h3 className="text-lg font-medium text-secondary-900 dark:text-white mb-2">
                No colleges found
              </h3>
              <p className="text-secondary-600 dark:text-secondary-400">
                {searchTerm 
                  ? 'Try adjusting your search criteria'
                  : 'No colleges are registered in this area yet'
                }
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {filteredColleges.map((college) => (
                <Link
                  key={college.id}
                  to={`/colleges/${college.id}`}
                  className="block p-6 border border-secondary-200 dark:border-secondary-700 rounded-lg hover:bg-secondary-50 dark:hover:bg-secondary-800 hover:border-primary-300 dark:hover:border-primary-600 transition-all duration-200 group"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-12 h-12 bg-gradient-to-br from-primary-500 to-primary-600 rounded-lg flex items-center justify-center text-white font-bold">
                        {college.name.charAt(0)}
                      </div>
                      <div>
                        <h3 className="font-semibold text-secondary-900 dark:text-white group-hover:text-primary-600 dark:group-hover:text-primary-400">
                          {college.name}
                        </h3>
                        <p className="text-sm text-secondary-600 dark:text-secondary-400">
                          Est. {college.established}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-1">
                      <span className="text-sm font-semibold text-secondary-900 dark:text-white">
                        {college.avgRating}
                      </span>
                      <div className="flex">
                        {Array.from({ length: 5 }, (_, i) => (
                          <div
                            key={i}
                            className={`w-2 h-2 rounded-full ${
                              i < Math.floor(college.avgRating) 
                                ? 'bg-yellow-400' 
                                : 'bg-secondary-300 dark:bg-secondary-600'
                            }`}
                          ></div>
                        ))}
                      </div>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div className="text-center">
                      <p className="text-lg font-bold text-secondary-900 dark:text-white">
                        {college.totalStudents}
                      </p>
                      <p className="text-xs text-secondary-600 dark:text-secondary-400">
                        Students
                      </p>
                    </div>
                    <div className="text-center">
                      <p className="text-lg font-bold text-secondary-900 dark:text-white">
                        {college.totalIdeas}
                      </p>
                      <p className="text-xs text-secondary-600 dark:text-secondary-400">
                        Ideas
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-2 text-center mb-4">
                    <div>
                      <p className="text-sm font-semibold text-yellow-600">
                        {college.pendingIdeas}
                      </p>
                      <p className="text-xs text-secondary-500 dark:text-secondary-400">
                        Pending
                      </p>
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-green-600">
                        {college.endorsedIdeas}
                      </p>
                      <p className="text-xs text-secondary-500 dark:text-secondary-400">
                        Endorsed
                      </p>
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-blue-600">
                        {college.acceptedIdeas}
                      </p>
                      <p className="text-xs text-secondary-500 dark:text-secondary-400">
                        Accepted
                      </p>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-secondary-200 dark:border-secondary-700">
                    <div className="flex items-center justify-between text-sm mb-2">
                      <span className="text-secondary-600 dark:text-secondary-400">
                        Success Rate
                      </span>
                      <span className="font-semibold text-secondary-900 dark:text-white">
                        {college.successRate}%
                      </span>
                    </div>
                    <div className="w-full bg-secondary-200 dark:bg-secondary-700 rounded-full h-2">
                      <div 
                        className="bg-primary-600 h-2 rounded-full transition-all duration-300" 
                        style={{ width: `${college.successRate}%` }}
                      ></div>
                    </div>
                  </div>

                  <div className="mt-3 flex items-center justify-between">
                    <div className="flex flex-wrap gap-1">
                      {college.departments.slice(0, 2).map((dept, index) => (
                        <span key={index} className="inline-flex px-2 py-1 text-xs bg-secondary-100 dark:bg-secondary-800 text-secondary-700 dark:text-secondary-300 rounded">
                          {dept}
                        </span>
                      ))}
                      {college.departments.length > 2 && (
                        <span className="inline-flex px-2 py-1 text-xs bg-secondary-100 dark:bg-secondary-800 text-secondary-700 dark:text-secondary-300 rounded">
                          +{college.departments.length - 2} more
                        </span>
                      )}
                    </div>
                    <FiEye className="text-secondary-400 group-hover:text-primary-600 dark:group-hover:text-primary-400" size={16} />
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AreaDetail;
