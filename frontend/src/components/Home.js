// src/pages/HomePage.jsx;
import React, { useState, useEffect, use } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/home.css';


const HomePage = () => {
  const navigate = useNavigate();
  const [scholarships, setScholarships] = useState([{
          _id: "1",
          shortDescription: "This is a sample scholarship description.",
          deadline: "12-12-2025" ,
          name: "Name" ,
          amountType: "Full" , 
          description: "nothing",
          minGPA: 7.5,
          location: "INDIA",
          eligibleCourses: ['CSE','ECE','EEE'],
          provider: "NTSE",
          contactEmail: "ntse@gmail.com",
          contactPhone: 123456789,
          website: "http://localhost:3000"
        }]);
  const [loading, setLoading] = useState(true);
  const [filteredScholarships, setFilteredScholarships] = useState([...scholarships]);
  const [filter, setFilter] = useState({
    category: '',
    deadline: '',
    search: '',
    eligibilitySearch: ''
  });

  useEffect(() => {
  const jwtoken = localStorage.getItem('jwtoken');
  if (!jwtoken) {
    navigate('/login');
  }
}, []); // ✅ Add empty dependency array to run once on mount



  useEffect(() => {
    const fetchScholarships = async () => {
      try {
        const response = await fetch('http://localhost:5000/scholarships');
        const data = await response.json();
        console.log(data);
        setScholarships(data);
        setFilteredScholarships(data);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching scholarships:', error);
        setLoading(false);
      }
    };

    fetchScholarships();
  }, []);

   useEffect(() => {
  const applyFilters = () => {
    let filtered = scholarships;

    if (filter.category) {
      filtered = filtered.filter(scholarship => scholarship.category === filter.category);
    }

    if(filter.deadline === 'always-open') {
      filtered = filtered.filter(scholarship => scholarship.Deadline === 'Always Open');
    } else if (filter.deadline === 'six-months') {
      const sixMonthsAgo = new Date();
      sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() + 6);
      filtered = filtered.filter(scholarship => new Date(scholarship.Deadline) <= sixMonthsAgo);
    } else if (filter.deadline === 'month') {
      const oneMonthAgo = new Date();
      oneMonthAgo.setMonth(oneMonthAgo.getMonth() + 1);
      filtered = filtered.filter(scholarship => new Date(scholarship.Deadline) <= oneMonthAgo);
    } else if (filter.deadline === 'week') {
      const oneWeekAgo = new Date();
      oneWeekAgo.setDate(oneWeekAgo.getDate() + 7);
      filtered = filtered.filter(scholarship => new Date(scholarship.Deadline) <= oneWeekAgo);
    }

    if (filter.search !== '') {
      filtered = filtered.filter(scholarship =>
        scholarship.name.toLowerCase().includes(filter.search.toLowerCase()) ||
        scholarship.Description.toLowerCase().includes(filter.search.toLowerCase())
      );
    }

    if (filter.eligibilitySearch !== '') {
      filtered = filtered.filter(scholarship =>
        scholarship.Eligibility.toLowerCase().includes(filter.eligibilitySearch.toLowerCase())
      );
    }

    setFilteredScholarships(filtered);
  };

  applyFilters();
}, [filter, scholarships]); // ✅ Only re-run when filter or scholarships change


  const handleScholarshipClick = (id) => {
    navigate(`/scholarship/${id}`);
  };

  const urgentDeadlines = scholarships.filter(scholarship => {
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() + 7);
    return (new Date(scholarship.Deadline) <= oneWeekAgo);
  });

  return (
    <div className="home-wrapper">
    <div className="home-page">
      <div className="home-container">
        <header className="home-header">
          <h1 className='heading1'>Find Your Perfect Scholarship</h1>
          <div className="urgent-notifications">
            {urgentDeadlines.length > 0 && (
              <div className="urgent-alert">
                <span>⚠️</span> {urgentDeadlines.length} scholarships with approaching deadlines!
              </div>
            )}
          </div>
        </header>

        <div className="filter-section">
          <h2>Filters</h2>
          <div className="filter-grid">
            <div className="filter-group">
              <label htmlFor="category">Category:</label>
              <select onChange={(e)=>{setFilter({...filter,category:e.target.value})}} id="category" name="category">
                <option value="">All Categories</option>
                <option value="monetary">Monetary</option>
                <option value="tuition_waiver">Tuition Waiver</option>
                <option value="mixed">Mixed</option>
                <option value="other">Other</option>
              </select>
            </div>
            <div className="filter-group">
              <label htmlFor="deadline">Deadline:</label>
              <select onChange={(e)=>{setFilter({...filter,deadline:e.target.value})}} id="category" name="category">
                <option value="">All</option>
                <option value="week">Week</option>
                <option value="month">Month</option>
                <option value="six-months">Six Months</option>
                <option value="always-open">Always Open</option>
              </select>
            </div>
            <div className='filter-group'>
              <label>Search:</label>
              <input 
                placeholder='Search Anything' 
                type='text' 
                onChange={(e)=>{setFilter({...filter,search:e.target.value})}} 
              />
            </div>
            <div className='filter-group'>
              <label>Eligibility Search:</label>
              <input 
                placeholder='Eg: Undergraduate, PhD, etc.' 
                type='text' 
                onChange={(e)=>{setFilter({...filter,eligibilitySearch:e.target.value})}} 
              />
            </div>
          </div>
        </div>

        <div className="scholarships-list">
          {loading ? (
            <div className="loading">Loading scholarships...</div>
          ) : filteredScholarships.length === 0 ? (
            <div className="no-results">No scholarships match your filters.</div>
          ) : (
            filteredScholarships.map(scholarship => (
              <div key={scholarship._id} className="scholarship-card">
                  <div className="card-top">
                  <div className="scholarship-title">
                    <h3>{scholarship.name}</h3>
                  </div>

                  <div className="scholarship-details">
                    <div className="scholarship-category">
                      <span className="amount-badge">{scholarship.category}</span>
                    </div>
                    <div className="scholarship-deadline">
                      <span>
                        Deadline: {
                          new Date(scholarship.Deadline).toLocaleDateString() === "Invalid Date" ?
                          scholarship.Deadline :
                          new Date(scholarship.Deadline).toLocaleDateString()
                        }
                      </span>
                    </div>
                  </div>

                  <div className="scholarship-description">
                    <p className="description">{scholarship.Description}</p>
                  </div>

                  <div className="scholarship-eligibility">
                    <span>Course: All Courses</span>
                    <span>GPA: 6+</span>
                  </div>
                   </div>
                  <div className="card-bottom">
                    <button className="apply" onClick={() => handleScholarshipClick(scholarship._id)}>
                      Apply Now
                    </button>
                  </div>
                </div>

            ))
          )}
        </div>
      </div>
    </div>
    </div>
  );
};

export default HomePage;