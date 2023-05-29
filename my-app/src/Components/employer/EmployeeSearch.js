import React, { useState, useEffect } from 'react';
import CandidateProfile from './CandidateProfile.js';
import Image from 'react-bootstrap/Image'
import "./employerCSS/employeeSearch.css";
import { Spinner } from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';

function EmployeeSearch(props) {
  const [loading, setLoading] = useState(true);//loading state
  const [employeesList, setEmployeesList] = useState([]); // store all users of type jobseeker
  const [jobTitleApplicant, setJobTitleApplicant] = useState("");// set the job title of the job seeker
  const [jobApplicantLocation, setJobApplicantLocation] = useState("");//set the location of the job seeker
  const [newFilteredList, setNewFilteredList] = useState([]);//store a filtered list of job seekers
  const [selectedUserId, setSelectedUserId] = useState(null);//store a selected job seeker id
  const [openCandidateProfile, setOpenCandidateProfile] = useState(false);// flag to open candidate profile page
  const imgUrl = "http://unn-w20039534.newnumyspace.co.uk/myplace/php/profileimage?userid=";//store the profile image

  //use useEffect to retrieve all users from DB and store them into the userDetails status
  useEffect(() => {
    fetch("http://unn-w20039534.newnumyspace.co.uk/myplace/php/user?usertype=jobseeker")
      .then(
        (response) => response.json()
      )
      .then(
        (json) => {
          //set user details once json data is retrieved
          setEmployeesList(json.data);
          setLoading(false);
        }
      )
      .catch((err) => {
        console.log(err.message);
      });

  }, []);
  //close candidate profile
  const closeCandidateProfile = () => {
    setOpenCandidateProfile(false);
  }
  //handle job seeker title
  const handleTitleApplicant = (event) => {
    setJobTitleApplicant(event.target.value);
  }
  //handle job seeker location
  const handleJobApplicationLocation = (event) => {
    setJobApplicantLocation(event.target.value);
  }
  //filter the job seeker list by the job seeker title
  const jobTitleFilter = (value) => {
    return jobTitleApplicant ? value.jobTitle.toLowerCase().includes(jobTitleApplicant.toLowerCase()) : true;
  }
  //filter the job seeker list by the location
  const locationFilter = (value) => {
    return jobApplicantLocation ? value.city.toLowerCase().includes(jobApplicantLocation.toLowerCase()) : true;
  }
  //handle the search by using the filters and displaying the list of job seekers that matches the criterias
  const handleSearch = () => {
    setNewFilteredList(employeesList.filter(jobTitleFilter).filter(locationFilter));
  }
  //handle the profile byutton to open the profile of the job seeker
  const handleProfileButtonClick = (userId) => {
    setSelectedUserId(userId);
    setOpenCandidateProfile(true);
  };

  //display the list of job seekers
  const seekerList = newFilteredList.map(
    (value) => {
      return (
        <div key={value.user_id}>
          <div className="userImage">
            {<Image src={imgUrl + value.user_id}
              style={{ borderRadius: "50%", width: "160px", height: "150px" }}
              fluid={true}
              roundedCircle={true}
              thumbnail={true} />}
          </div>
          <p>Name: {value.firstName} {value.lastName}</p>
          <p>Job Title: {value.jobTitle}</p>
          <p>Prefered Salary: {value.prefSalary}</p>
          <p>City: {value.city}</p>
          {/**see profile */}
          <button onClick={() => handleProfileButtonClick(value.user_id)}>View Profile</button>
        </div>
      );
    }
  );

  return (
    <div>
      {/** Show Spinner until the data gets fetched */}
      {loading ? (
        <h4 className="d-flex justify-content-center" style={{ marginTop: '20%' }}>
          <Spinner animation="border" role="status">
          </Spinner>
          <span> Loading Data...</span>
        </h4>
      ) : (
        <div className="nomineeContainer">
          {/**if job seeker profile not opened, display the input fields to search job seekers */}
          {!openCandidateProfile && <div> <div className="searchingElements">
            <input type="text"
              placeholder="Job Title Applicant"
              style={{
                borderRadius: "20px",
                width: '40%',
                padding: '12px 20px',
                margin: '8px 5px 8px 1px',
                border: '1px solid #ccc',
                boxSizing: 'border-box'
              }}
              onChange={handleTitleApplicant}
            />

            <input type="text"
              placeholder="Location"
              style={{
                borderRadius: "20px",
                width: '40%',
                padding: '12px 20px',
                margin: '8px 5px 8px 1px',
                border: '1px solid #ccc',
                boxSizing: 'border-box'
              }}
              onChange={handleJobApplicationLocation}
            />
            <button
              type="search"
              value="Search"
              style={{
                backgroundColor: '#62B1F6',
                borderRadius: "20px",
                color: 'white',
                padding: '14px 20px',
                margin: '8px 5px 8px 5px',
                border: 'none',
                cursor: 'pointer',
                width: 'auto',

              }}
              onClick={handleSearch}
            >Search</button>
          </div>
            {/**display job seekers if existing, else display not found */}
            {employeesList.length > 0 ? <div className="userList">{seekerList}</div> : <h4>Not Found</h4>} </div>}
          {/**open job seeker profile */}
          {openCandidateProfile && <CandidateProfile myuserid={props.userid} userid={selectedUserId} closeCandidateProfile={closeCandidateProfile} />}
        </div>)}
    </div>
  );
}

export default EmployeeSearch;
