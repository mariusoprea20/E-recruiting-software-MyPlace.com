import React, { useState, useEffect } from 'react';
import JobApplication from './JobApplication.js';
import Modal from 'react-modal';
import Image from 'react-bootstrap/Image';
import "./jobseekerCSS/savedjobs.css";
import { Spinner } from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';

// get the html element with id 'rootX' and assign it to'appElement'
const appElement = document.getElementById('rootX');
// set the app element for the Modal component to 'appElement'
// this tells the Modal component where it should be rendered
Modal.setAppElement(appElement);

function SavedJobs(props) {
    const [loading, setLoading] = useState(true);//loading state
    const [userID, setUserID] = useState(props.userID);
    const [applicationsMade, setApplicationsMade] = useState([]); // set all job applications made by this user
    const [applicationDatesByJobId, setApplicationDatesByJobId] = useState({});// store all application dates as key-value objects[jobid: applicationDates]
    // object to store all job applications in real time and display "succesfull message" when user just applied for the job
    const [appliedJobs, setAppliedJobs] = useState({});
    const [currentJob, setCurrentJob] = useState(null); //store the current job when user clicks apply
    const [showJobModal, setShowJobModal] = useState(false); //display modal {false}
    const [savedJobsList, setSavedJobsList] = useState([]); // store all the saved jobs made by this user
    const [updated, setUpdated] = useState(0);
    const [jobDetails, setJobDetails] = useState([]); // get all jobs from the database
    const handleUpdate = () => { setUpdated(updated + 1) }
    const token = localStorage.getItem("token"); //get the stored jwt token
    const imgUrl = "http://unn-w20039534.newnumyspace.co.uk/myplace/php/profileimage?userid="; // store the URL of the image endpoint

    //get all jobs
    useEffect(() => {
        fetch("http://unn-w20039534.newnumyspace.co.uk/myplace/php/job")
            .then((response) => response.json())
            .then(
                (json) => {
                    if (json.message === "success") {
                        setJobDetails(json.data);
                    }
                    setLoading(false);//loaded
                }
            )
            .catch((e) => {
                console.log(e.message());
            })
    }, [])

    //retrieve all the saved jobs made by this user
    useEffect(() => {
        fetch("http://unn-w20039534.newnumyspace.co.uk/myplace/php/savedjob", {
            method: "POST",
            headers: new Headers({ Authorization: "Bearer " + token })
        })
            .then((response) => response.json())
            .then((json) => {
                if (json.message === "success") {
                    //iterate over the data retrieved from the endpoint and add oly job_ids
                    const jobids = [];
                    json.data.forEach((item) => {
                        jobids.push(item.job_id);
                    });
                    //add all saved job ids to the list
                    setSavedJobsList(jobids);
                }
            })
            .catch((e) => {
                console.log(e.message);
            });
    }, [updated]); //end

    //retrieve all application details from the php endpoint
    // pass the token through the auth header and set the method to post
    useEffect(() => {
        fetch("http://unn-w20039534.newnumyspace.co.uk/myplace/php/applicationdetails", {
            method: "POST",
            headers: new Headers({ Authorization: "Bearer " + token })
        })
            .then((response) => response.json())
            .then((json) => {
                if (json.message === "success") {
                    // all job applications made by logged user
                    setApplicationsMade(json.data);
                    // Map job_ids to their application dates
                    const datesByJobId = {};
                    json.data.forEach((item) => {
                        datesByJobId[item.job_id] = item.application_date;
                    });
                    //add them to the useState()
                    setApplicationDatesByJobId(datesByJobId);
                }
            })
            .catch((e) => {
                console.log(e.message);
            });
    }, [updated]);//end

    /**
    * function used in filteredJobData.map() for unsaving the job.
    */
    const handleUnsave = (job) => {
        const dataForm = new FormData();
        dataForm.append("jobid", job.job_id);
        dataForm.append("userid", userID);
        fetch("http://unn-w20039534.newnumyspace.co.uk/myplace/php/unsavejob", {
            method: "POST",
            headers: new Headers({ Authorization: "Bearer " + token }),
            body: dataForm
        })
            .then((response) => response.json())
            .then(
                (json) => {
                    if (json.message === "success") {
                        handleUpdate();
                    }
                }
            )
            .catch((e) => { console.log(e.message()) })
    }//end

    //handle the application if user wants to apply
    const handleApply = (job) => {
        setCurrentJob(job);
        setShowJobModal(true);
    };

    /**
    * function passed to JobApplication Component to close the Modal
    * updates the appliedJobs
    */
    const handndleShowJobModal = (value) => {
        setShowJobModal(value);
    }
    const handleApplicationStatus = (jobid, status) => {
        setAppliedJobs({ ...appliedJobs, [jobid]: status });
    };
    //filter the job details based on the saved job ids
    const filteredJobs = jobDetails.filter((job) => {
        return savedJobsList.includes(job.job_id);
    });

    const savedJobs = filteredJobs.map(
        (value) => {
            /**
            * isJobApplied assigned with true of false if the existing application on the current job is done.
            * some() returns true or false
            */
            const isJobApplied = applicationsMade.some((application) => application.job_id === value.job_id);

            return (
                <div key={value.job_id}>
                    <div className="myJobList">
                        <div className="employerJobImg">
                            <Image src={imgUrl + value.user_id + '&timestamp=' + new Date().getTime()}
                                fluid={true}
                                thumbnail={true}
                                style={{ width: '250px', height: '250px', objectFit: 'cover' }}
                            />
                        </div>
                        <div className="searchPageJobDetails">
                            {/* if application made for this job, access applicationDatesByJobId by this value.jobid and display last application date*/}
                            {isJobApplied === true ? <p className="appliedStatus">Last Applied: {applicationDatesByJobId[value.job_id]}</p> : ""}
                            <h6>Job Name: {value.job_name}</h6>
                            <p>Job Type: {value.job_type}</p>
                            <p>Job Date: {value.job_datePosted}</p>
                            <p>Job Salary: {value.job_salary}</p>
                            <p>Job City: {value.job_city}</p>
                            <p>Job Postcode: {value.job_postcode}</p>
                        </div>
                        {/**Get the current job id and the boolean value.
                          * Display success message in real time after the user applied to this job.
                          * If true, hide the buttons
                         */}
                        {appliedJobs[value.job_id] ? (
                            <p>Succesfully Applied</p>
                        ) : (
                            <div className="savedJobsBtns">
                                {/**Display modal when the user clicks on the Apply button */}
                                <button onClick={() => handleApply(value)}>Apply</button>
                                {/**if the job was previously saved, display "Unsave button" else display "Save button" */}
                                <button onClick={() => handleUnsave(value)}>Unsave</button>
                            </div>
                        )}
                    </div>
                </div>
            );
        }
    );


    return (
        <div>
            {/**Use conditional rendering to display a spinner until the data gets loaded */}
            {loading ? (
                <h4 className="d-flex justify-content-center" style={{ marginTop: '20%' }}>
                    <Spinner animation="border" role="status">
                    </Spinner>
                    <span> Loading Data...</span>
                </h4>
            ) : (
                <div className="allSavedJobs">
                    {/**Display modal when the user clicks on the Apply button */}
                    <Modal
                        isOpen={showJobModal}
                        onRequestClose={() => setShowJobModal(false)}
                        style={{
                            content: {
                                width: "100%",
                                height: "100%",
                                marginTop: "1%",
                                marginLeft: "-40px"
                            }
                        }}
                    >
                        {/**Display JobApplication in the Modal */}
                        <JobApplication
                            jobDetails={currentJob}
                            userID={userID}//TODO:pass the user id to this component
                            handndleShowModal={handndleShowJobModal}
                            handleApplicationStatus={handleApplicationStatus}
                            handleUpdate={handleUpdate}
                        />
                    </Modal>
                    <div className="allSeekerSavedJobs">{savedJobs}</div>
                </div>)}
        </div>
    );

}

export default SavedJobs;