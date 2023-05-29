import React, { useState, useEffect } from 'react';
import Candidates from './Candidates.js';
import "./employerCSS/jobapplications.css";

function JobApplications(props) {

    const [data, setData] = useState([]); // get all jobs made by this employer
    const [currentJobID, setCurrentJobID]= useState(0);//set the current job id
    const [displayCandidateList, setDisplayCandidateList ] = useState(false);// display the candidate list (flag)
    const [jobApplication, setJobApplication] = useState([]);//get all job applications related to a job
    const [updated, setUpdated] = useState(0); //update the useEffect hooks
    const handleUpdate = () => { setUpdated(updated + 1) } // handle update for useEffect

    //retrieve all the jobs that belongs to this employer
    useEffect(() => {
        fetch("http://unn-w20039534.newnumyspace.co.uk/myplace/php/job?userid=" + props.userid)
          .then((response) => response.json())
          .then((json) => {
            if (json.message === "success") {
              setData(json.data); // store them in a useState
            } else {
              console.log("failure");
            }
    
          })
          .catch((e) => {
            console.log(e.message());
          });
      }, []); // end

      /**
       * Get all the job applications related to the current job id.
       * Pass the retrieved job id to the url to match it with the details in DB
       */
      useEffect(() => {
        if (currentJobID > 0) {
          fetch("http://unn-w20039534.newnumyspace.co.uk/myplace/php/jobapplication?jobid=" + currentJobID)
            .then((response) => response.json())
            .then((json) => {
              if (json.message === "success") {
                setJobApplication(json.data);//store the job applications
              }
            })
            .catch((e) => {
              console.log(e.message);
            });
        }
      }, [updated]);
      

//handle the job applications
      const handleJobApplicants=(jobid)=>{
        //set the current JobID
        setCurrentJobID(jobid);
        //update the useEffect() to provide the current job it
        handleUpdate();
        //display the candidate list
        setDisplayCandidateList(true);

      }
 
      //use the callback function map() to iterate over to display the jobs
      const joblist= data.map(
        (value)=>{
            return(
                <div key={value.job_id} className="jobsToApply">
                    <h2>{value.job_name}</h2>
                    <p>Job Type: {value.job_type}</p>
                    <p>Job Salary: £{value.job_salary}</p>
                    <p>Location:{value.job_city}</p>
                    {/**invoke the handleJobApplicants */}
                    <button onClick={()=>handleJobApplicants(value.job_id)}>View applicants</button>
                </div>
            );
        }
      );

      const handleBackToList = ()=>{
        setDisplayCandidateList(false);
      }
    return (
        <div className ="applicationList">
            {/**Call the joblist if the candidate list is not displayed */}
            {!displayCandidateList && joblist}
            {/**display the canidate list */}
            {displayCandidateList && <div className="myCandidates"><Candidates  myid={props.userid} jobApplication={jobApplication} handleUpdate={handleUpdate}  goBack={handleBackToList}/></div>}
        </div>
    );

}
export default JobApplications;