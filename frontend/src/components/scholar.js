// src/pages/ScholarshipDetailPage.js
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import '../styles/scholar.css';

const ScholarshipDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [scholarship, setScholarship] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchScholarshipDetails = async () => {
      try {
        const response = await fetch(`http://localhost:5000/scholarship/${id}`);
        const Data = await response.json();
        console.log(Data);
        const ddata={
          "Eligibility": "PhD degree holders",
          "Region": "India",
          "Deadline": "Always Open",
          "Award": "INR 45,000 to INR 55,000 per month plus HRA",
          "Description": "The Indian Institute of Technology, Bhubaneswar is inviting applications for IIT Bhubaneswar Post Doctoral Fellowship Programme 2020 from PhD degree holders below 35 years of age. The fellows will be required to participate in the teaching and research activities of the Institute including mentoring young undergraduates and post-graduate students. The selected fellows will receive a fellowship of  INR 45,000 to INR 55,000 per month plus HRA (depending upon the experience and qualification).",
          "Email": "ar.acad@iitbbs.ac.in",
          "Contact Number": "0674-7134578",
          "link": "http://webapps.iitbbs.ac.in/pdf-application/index.php",
          "category": "mixed",
          "Links": "{'Apply online link': 'http://webapps.iitbbs.ac.in/pdf-application/pdf-registration.php', 'Latest scholarship link': 'http://webapps.iitbbs.ac.in/pdf-application/index.php', 'Others': 'http://webapps.iitbbs.ac.in/pdf-application/pdf-usefull-info-01.pdf'}",
          "contactDetails": "Assistant Registrar (Academic Affairs)\nIndian Institute of Technology Bhubaneswar\nArgul, Khordha-752050, ODISHA\nE-mail id – ar.acad@iitbbs.ac.in\nContact No. – 0674-7134578",
          "name": "Name"
        }
        const data = Data[0] || ddata; // Use the first item or sample data if not found
        if (!response.ok) {
          throw new Error(data.message || 'Failed to fetch scholarship details');
        }

        setScholarship(data);
        setLoading(false);
      } catch (err) {
        setError(err.message);
        setLoading(false);
      }
    };

    fetchScholarshipDetails();
  }, [id]);

  const handleBackClick = () => {
    navigate(-1);
  };

  const handleApplyClick = () => {
    // In a real app, this would redirect to the application page or external site
    const links = JSON.parse(scholarship.Links.replace(/'/g, '"'));
    if(links['Apply online link']){
      window.open(links['Apply online link'], '_blank');
    }
  };

  if (loading) {
    return <div className="loading">Loading scholarship details...</div>;
  }

  if (error) {
    return <div className="error">{error}</div>;
  }

  if (!scholarship) {
    return <div className="not-found">Scholarship not found</div>;
  }

  const deadline = (new Date(scholarship.Deadline) === "Invalid Date" ? scholarship.Deadline : new Date(scholarship.Deadline));
  const now = new Date();
  const diffTime = deadline - now;
  const links = JSON.parse(scholarship.Links.replace(/'/g, '"'));
  let diffDays = -1;
  if(new Date(scholarship.Deadline).toLocaleDateString() !== "Invalid Date"){
    diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }

  return (
  <div className="scholarship-detail-container">
    <button onClick={handleBackClick} className="back-button">
      &larr; Back to Scholarships
    </button>

    <h1 className="scholarship-title">{scholarship.name}</h1>

   

    <div className="scholarship-body">
      <div className="scholarship-left">

        <div className="section">
          <h2>Description</h2>
          <p>{scholarship.Description}</p>
        </div>

        
        <div className="section">
          <h2>Contact Info</h2>
          <p>{scholarship.contactDetails}</p>
        </div>

        <div className="section">
          <h2>Quick Facts</h2>
          
            <li><strong>Provider:</strong> {scholarship.name}</li>
            <li><strong>Funding Type:</strong> {scholarship.category}</li>
          
        </div>

      </div>

      <div className="scholarship-right">

        <div className="section">
         <div className="scholarship-meta-inline">
            <span className="amount-badge">{scholarship.category} Funding</span>
            <span className="deadline">
                Deadline: {deadline.toLocaleDateString()} {diffDays > 0 ? `(${diffDays} days left)` : ""}
            </span>
          </div>

        </div>

        <div className="section">
          <h2>Eligibility Criteria</h2>
          
            <li>{scholarship.Eligibility}</li>
            <li><strong>Location:</strong> {scholarship.Region}</li>
        
         </div>

        <div className="section">
          <h2>Benefits</h2>
          <p>{scholarship.Award}</p>
        </div>

        <div className="section">
          
          <h3>Website Link</h3>
          
            <a href={links['Latest scholarship link']} target="_blank" rel="noopener noreferrer">
              {links['Latest scholarship link']}
            </a>
    
        </div>

       
      </div>
      
    </div>

   
    <div className='footer'>

      <div className="section">
          
          <button
            onClick={handleApplyClick}
            className="apply-button"
            disabled={diffDays <= 0}
          >
            {diffDays <=0 ? 'Application Closed' : 'Apply Now'}
          </button>
    </div>
    
    </div>

   
     </div>
);

};

export default ScholarshipDetailPage;