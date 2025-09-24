const axios = require('axios');

const BASE_URL = 'http://localhost:3001/api';

async function createTestIdea() {
  try {
    console.log('Creating test idea...');
    
    // First login as a student to create an idea
    const loginResponse = await axios.post(`${BASE_URL}/auth/login`, {
      email: 'student@example.com',
      password: 'password123'
    }, {
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    const token = loginResponse.data.data.token;
    console.log('Logged in as student');
    
    // Create a new idea
    const ideaData = {
      title: 'Test Idea for Endorsement',
      description: 'This is a test idea for testing the endorsement functionality.',
      category: 'Technology',
      problem_statement: 'Test problem statement',
      solution_approach: 'Test solution approach',
      market_potential: 'Test market potential',
      technical_feasibility: 'High',
      business_model: 'Test business model',
      competitive_analysis: 'Test competitive analysis',
      risk_assessment: 'Low',
      success_metrics: ['Test metric 1', 'Test metric 2'],
      tags: ['Test', 'Technology'],
      team_size: 3,
      funding_required: 100000,
      timeline: '6 months'
    };
    
    const response = await axios.post(`${BASE_URL}/ideas`, ideaData, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    console.log('Test idea created successfully!');
    console.log('Response:', JSON.stringify(response.data, null, 2));
    
    return response.data;
  } catch (error) {
    console.error('Failed to create test idea!');
    console.error('Status:', error.response?.status);
    console.error('Data:', error.response?.data);
    console.error('Message:', error.message);
    return null;
  }
}

createTestIdea();
