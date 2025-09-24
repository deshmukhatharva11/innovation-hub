import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import {
  FiMapPin, 
  FiMail, 
  FiPhone, 
  FiGlobe, 
  FiUsers,
  FiZap,
  FiCheckCircle,
  FiClock,
  FiTrendingUp,
  FiAward,
  FiCalendar,
  FiBookOpen,
  FiArrowLeft,
  FiDownload,
  FiSearch,
  FiFilter,
  FiEye
} from 'react-icons/fi';
import { collegesAPI, usersAPI, ideasAPI } from '../../services/api';
import { toast } from 'react-hot-toast';

const CollegeDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);
  const [college, setCollege] = useState(null);
  const [students, setStudents] = useState([]);
  const [filteredStudents, setFilteredStudents] = useState([]);
  const [ideas, setIdeas] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState('all');
  const [yearFilter, setYearFilter] = useState('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCollegeData();
  }, [id]);

  const fetchCollegeData = async () => {
    try {
      setLoading(true);
      
      // Fetch college details
      const collegeResponse = await collegesAPI.getById(id);
      
      // Fetch students from this college
      const studentsResponse = await usersAPI.getStudents({
        college_id: id,
        limit: 1000
      });
      
      // Fetch ideas from this college
      const ideasResponse = await ideasAPI.getAll({
        college_id: id,
        limit: 1000
      });

      if (collegeResponse.data?.data?.college) {
        const fetchedCollege = collegeResponse.data.data.college;
        
        setCollege({
          id: fetchedCollege.id,
          name: fetchedCollege.name,
          fullName: fetchedCollege.name,
          location: `${fetchedCollege.city}, ${fetchedCollege.state}`,
          established: fetchedCollege.established_year,
          website: fetchedCollege.website,
          contactEmail: fetchedCollege.contact_email,
          contactPhone: fetchedCollege.phone,
          totalStudents: studentsResponse.data?.data?.students?.length || 0,
          totalIdeas: ideasResponse.data?.data?.ideas?.length || 0,
          pendingIdeas: ideasResponse.data?.data?.ideas?.filter(idea => idea.status === 'submitted').length || 0,
          endorsedIdeas: ideasResponse.data?.data?.ideas?.filter(idea => idea.status === 'endorsed').length || 0,
          acceptedIdeas: ideasResponse.data?.data?.ideas?.filter(idea => idea.status === 'incubated').length || 0,
          successRate: fetchedCollege.success_rate || 0,
          departments: fetchedCollege.departments || [],
          recentAchievements: fetchedCollege.achievements || []
        });
      }

      if (studentsResponse.data?.data?.students) {
        const fetchedStudents = studentsResponse.data.data.students.map(student => ({
          id: student.id,
          name: student.name,
          email: student.email,
          phone: student.phone,
          department: student.department || 'Not specified',
          year: student.year_of_study || 'Not specified',
          registeredAt: student.created_at,
          ideasCount: student.ideas_count || 0,
          endorsedIdeas: student.endorsed_ideas_count || 0,
          acceptedIdeas: student.accepted_ideas_count || 0,
          avatar: student.profile_image_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(student.name)}&background=random`,
          isActive: student.is_active,
          lastLogin: student.last_login || student.created_at,
          gpa: student.gpa || 'Not specified',
          recentIdeas: student.recent_ideas || []
        }));
        
        setStudents(fetchedStudents);
        setFilteredStudents(fetchedStudents);
      }

      if (ideasResponse.data?.data?.ideas) {
        setIdeas(ideasResponse.data.data.ideas);
      }

    } catch (error) {
      console.error('Error fetching college data:', error);
      toast.error('Failed to load college details');
    } finally {
    setLoading(false);
    }
  };

  useEffect(() => {
    let filtered = students;

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(student =>
        student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        student.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        student.department.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filter by department
    if (departmentFilter !== 'all') {
      filtered = filtered.filter(student => student.department === departmentFilter);
    }

    // Filter by year
    if (yearFilter !== 'all') {
      filtered = filtered.filter(student => student.year.toString() === yearFilter);
    }

    setFilteredStudents(filtered);
  }, [students, searchTerm, departmentFilter, yearFilter]);

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };



  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return 'text-yellow-600 bg-yellow-100 dark:bg-yellow-900/20';
      case 'endorsed': return 'text-green-600 bg-green-100 dark:bg-green-900/20';
      case 'accepted': return 'text-blue-600 bg-blue-100 dark:bg-blue-900/20';
      case 'rejected': return 'text-red-600 bg-red-100 dark:bg-red-900/20';
      default: return 'text-secondary-600 bg-secondary-100 dark:bg-secondary-900/20';
    }
  };

  const exportStudents = () => {
    const csvContent = [
      ['Name', 'Email', 'Department', 'Year', 'Ideas Count', 'Endorsed Ideas', 'Accepted Ideas', 'GPA', 'Status'],
      ...filteredStudents.map(student => [
        student.name,
        student.email,
        student.department,
        student.year,
        student.ideasCount,
        student.endorsedIdeas,
        student.acceptedIdeas,
        student.gpa,
        student.isActive ? 'Active' : 'Inactive'
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${college.name}_students.csv`;
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

  if (!college) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold text-secondary-900 dark:text-white mb-4">
          College Not Found
        </h2>
        <p className="text-secondary-600 dark:text-secondary-400 mb-6">
          The college you're looking for doesn't exist or has been removed.
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

  const departments = [...new Set(students.map(student => student.department))];
  const years = [...new Set(students.map(student => student.year))].sort();

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
            {college.name}
          </h1>
          <p className="text-secondary-600 dark:text-secondary-400">
            {college.fullName} • {college.location}
          </p>
        </div>
        <button
          onClick={exportStudents}
          className="btn-outline"
        >
          <FiDownload className="mr-2" size={16} />
          Export Students
        </button>
      </div>

      {/* College Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* College Info */}
        <div className="lg:col-span-1">
          <div className="card p-6">
            <div className="flex items-center space-x-4 mb-6">
              <div className="w-16 h-16 bg-gradient-to-br from-primary-500 to-primary-600 rounded-xl flex items-center justify-center text-white font-bold text-2xl">
                {college.name.charAt(0)}
              </div>
              <div>
                <h3 className="text-xl font-semibold text-secondary-900 dark:text-white">
                  {college.name}
                </h3>
                <p className="text-secondary-600 dark:text-secondary-400">
                  Est. {college.established}
                </p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <FiMapPin className="text-secondary-400" size={16} />
                <span className="text-secondary-700 dark:text-secondary-300">
                  {college.location}
                </span>
              </div>
              <div className="flex items-center space-x-3">
                <FiMail className="text-secondary-400" size={16} />
                <a 
                  href={`mailto:${college.contactEmail}`}
                  className="text-primary-600 hover:text-primary-700 dark:text-primary-400"
                >
                  {college.contactEmail}
                </a>
              </div>
              <div className="flex items-center space-x-3">
                <FiPhone className="text-secondary-400" size={16} />
                <span className="text-secondary-700 dark:text-secondary-300">
                  {college.contactPhone}
                </span>
              </div>
            </div>

            <div className="mt-6 pt-6 border-t border-secondary-200 dark:border-secondary-700">
              <h4 className="font-semibold text-secondary-900 dark:text-white mb-3">
                Recent Achievements
              </h4>
              <ul className="space-y-2">
                {college.recentAchievements.map((achievement, index) => (
                  <li key={index} className="flex items-start space-x-2">
                    <div className="w-2 h-2 bg-primary-500 rounded-full mt-2 flex-shrink-0"></div>
                    <span className="text-sm text-secondary-600 dark:text-secondary-400">
                      {achievement}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="lg:col-span-2">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="card p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-secondary-600 dark:text-secondary-400">
                    Students
                  </p>
                  <p className="text-2xl font-bold text-secondary-900 dark:text-white">
                    {college.totalStudents}
                  </p>
                </div>
                <div className="p-2 bg-blue-100 dark:bg-blue-900/20 rounded-lg">
                  <FiUsers className="text-blue-600 dark:text-blue-400" size={20} />
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
                    {college.totalIdeas}
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
                    Endorsed
                  </p>
                  <p className="text-2xl font-bold text-secondary-900 dark:text-white">
                    {college.endorsedIdeas}
                  </p>
                </div>
                <div className="p-2 bg-green-100 dark:bg-green-900/20 rounded-lg">
                  <FiCheckCircle className="text-green-600 dark:text-green-400" size={20} />
                </div>
              </div>
            </div>

            <div className="card p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-secondary-600 dark:text-secondary-400">
                    Success Rate
                  </p>
                  <p className="text-2xl font-bold text-secondary-900 dark:text-white">
                    {college.successRate}%
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

      {/* Students Section */}
      <div className="card">
        <div className="p-6 border-b border-secondary-200 dark:border-secondary-700">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <h2 className="text-lg font-semibold text-secondary-900 dark:text-white">
              Students ({filteredStudents.length})
            </h2>
          </div>
        </div>

        {/* Filters */}
        <div className="p-6 border-b border-secondary-200 dark:border-secondary-700">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Search */}
            <div className="md:col-span-2">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FiSearch className="h-5 w-5 text-secondary-400" />
                </div>
                <input
                  type="text"
                  placeholder="Search students..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="input-field pl-10"
                />
              </div>
            </div>

            {/* Department Filter */}
            <div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FiFilter className="h-5 w-5 text-secondary-400" />
                </div>
                <select
                  value={departmentFilter}
                  onChange={(e) => setDepartmentFilter(e.target.value)}
                  className="input-field pl-10"
                >
                  <option value="all">All Departments</option>
                  {departments.map(dept => (
                    <option key={dept} value={dept}>{dept}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Year Filter */}
            <div>
              <select
                value={yearFilter}
                onChange={(e) => setYearFilter(e.target.value)}
                className="input-field"
              >
                <option value="all">All Years</option>
                {years.map(year => (
                  <option key={year} value={year}>Year {year}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Students List */}
        <div className="p-6">
          {filteredStudents.length === 0 ? (
            <div className="text-center py-12">
              <FiUsers className="mx-auto text-secondary-400 mb-4" size={48} />
              <h3 className="text-lg font-medium text-secondary-900 dark:text-white mb-2">
                No students found
              </h3>
              <p className="text-secondary-600 dark:text-secondary-400">
                {searchTerm || departmentFilter !== 'all' || yearFilter !== 'all'
                  ? 'Try adjusting your search or filter criteria'
                  : 'No students have registered from this college yet'
                }
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {filteredStudents.map((student) => (
                <div key={student.id} className="border border-secondary-200 dark:border-secondary-700 rounded-lg p-4 hover:bg-secondary-50 dark:hover:bg-secondary-800 transition-colors duration-200">
                  <div className="flex items-start space-x-4">
                    <img
                      src={student.avatar}
                      alt={student.name}
                      className="w-12 h-12 rounded-full object-cover"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="font-semibold text-secondary-900 dark:text-white">
                          {student.name}
                        </h3>
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          student.isActive 
                            ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
                            : 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400'
                        }`}>
                          {student.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </div>
                      
                      <div className="space-y-1 text-sm text-secondary-600 dark:text-secondary-400">
                        <p>{student.department} • Year {student.year}</p>
                        <p>GPA: {student.gpa}</p>
                        <p>{student.email}</p>
                      </div>

                      <div className="mt-3 grid grid-cols-3 gap-2 text-center">
                        <div>
                          <p className="text-sm font-semibold text-secondary-900 dark:text-white">
                            {student.ideasCount}
                          </p>
                          <p className="text-xs text-secondary-500 dark:text-secondary-400">
                            Ideas
                          </p>
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-green-600">
                            {student.endorsedIdeas}
                          </p>
                          <p className="text-xs text-secondary-500 dark:text-secondary-400">
                            Endorsed
                          </p>
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-blue-600">
                            {student.acceptedIdeas}
                          </p>
                          <p className="text-xs text-secondary-500 dark:text-secondary-400">
                            Accepted
                          </p>
                        </div>
                      </div>

                      {student.recentIdeas.length > 0 && (
                        <div className="mt-3 pt-3 border-t border-secondary-200 dark:border-secondary-700">
                          <p className="text-xs font-medium text-secondary-700 dark:text-secondary-300 mb-2">
                            Recent Ideas:
                          </p>
                          <div className="space-y-1">
                            {student.recentIdeas.slice(0, 2).map((idea, index) => (
                              <div key={index} className="flex items-center justify-between">
                                <span className="text-xs text-secondary-600 dark:text-secondary-400 truncate">
                                  {idea.title}
                                </span>
                                <span className={`inline-flex px-1.5 py-0.5 text-xs rounded-full ${getStatusColor(idea.status)}`}>
                                  {idea.status}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      <div className="mt-3 flex space-x-2">
                        <a
                          href={`mailto:${student.email}`}
                          className="text-xs text-primary-600 hover:text-primary-700 dark:text-primary-400"
                        >
                          <FiMail size={14} />
                        </a>
                        <button className="text-xs text-secondary-600 hover:text-secondary-900 dark:text-secondary-400 dark:hover:text-white">
                          <FiEye size={14} />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CollegeDetail;
