import React, { useEffect, useState } from 'react';
import JobApplication from './JobApplication.js';
import Modal from 'react-modal';
import Image from 'react-bootstrap/Image';
import "./jobseekerCSS/recommendedjobs.css";
import { Spinner } from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';

// get the html element with id 'rootX' and assign it to'appElement'
const appElement = document.getElementById('rootX');
// set the app element for the Modal component to 'appElement'
// this tells the Modal component where it should be rendered
Modal.setAppElement(appElement);

function RecommendedJobs(props) {
    const [loading, setLoading] = useState(true);//loading state
    const [jobDetails, setJobDetails] = useState([]); // get all jobs from the database
    const jobNames = props.jobPreferencesList.map((preference) => preference.job_name);
    const jobLocations = props.jobPreferencesList.map((preference) => preference.job_city);
    const jobTypes = props.jobPreferencesList.map((preference) => preference.job_type);
    const minSalary = props.jobPreferencesList.map((preference) => preference.minSalary);
    const maxSalary = props.jobPreferencesList.map((preference) => preference.maxSalary);
    const [applicationsMade, setApplicationsMade] = useState([]); // set all job applications made by this user
    // object to store all job applications in real time and display "succesfull message" when user just applied for the job
    const [appliedJobs, setAppliedJobs] = useState({});
    const [currentJob, setCurrentJob] = useState(null); //store the current job when user clicks apply
    const [showJobModal, setShowJobModal] = useState(false); //display modal {false}
    const [updated, setUpdated] = useState(0); //update the useEffect hooks
    const handleUpdate = () => { setUpdated(updated + 1) } // handle update for useEffect
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
                    setLoading(false);//completed
                }
            )
            .catch((e) => {
                console.log(e.message());
            })
    }, [])

    //handle the application if user wants to apply for a job
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
                    // Map job_ids to their application dates
                    var JobIds = [];
                    json.data.forEach((item) => {
                        JobIds.push(item.job_id);
                    });
                    // all job applications made by logged user
                    setApplicationsMade(JobIds);
                }
            })
            .catch((e) => {
                console.log(e.message);
            });
    }, [updated]);

    //filtering mechanism
    const filteredJobs = jobDetails.filter((job) => {
        var salary = parseFloat(job.job_salary);
        //test and return the elements tha pass the comparison in the return statement
        //use some to iterate over the elements in the arrays and return true if the job matched criterias
        return jobNames.some((name, index) => {
            return job.job_name.toLowerCase().includes(name.toLowerCase()) &&
                jobLocations[index].toLowerCase() === job.job_city.toLowerCase() &&
                jobTypes[index].toLowerCase() === job.job_type.toLowerCase() &&
                !applicationsMade.includes(job.job_id) &&
                (salary >= minSalary[index] && salary <= maxSalary[index]);
        });
    });

    //call back function to render all recommended jobs based on job alerts preferences
    const allJobs = filteredJobs.map((value) => {

        // Add return statement here
        return (
            <div key={value.job_id} className="recommendedJobsList">
                <div className="employerJobImge">
                    <Image src={imgUrl + value.user_id + '&timestamp=' + new Date().getTime()}
                        fluid={true}
                        thumbnail={true}
                        style={{ width: '250px', height: '250px', objectFit: 'cover' }}
                    />
                </div>
                <div className="recommendedJobDetails">
                    <h6>Job Name: {value.job_name}</h6>
                    <p>Job Type: {value.job_type}</p>
                    <p>Job Date: {value.job_datePosted}</p>
                    <p>Job Salary: {value.job_salary}</p>
                    <p>Job City: {value.job_city}</p>
                    <p>Job Postcode: {value.job_postcode}</p>
                </div>
                {appliedJobs[value.job_id] ? (
                    <p>Succesfully Applied</p>
                ) : (
                    <div className="applyButtonRecommendedJob">
                        {/**Display modal when the user clicks on the Apply button */}
                        <button onClick={() => handleApply(value)}>Apply</button>
                    </div>
                )}
            </div>
        );
    });

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
                <div className="recommendedJobClass">
                    <h4>Recomended Jobs</h4>
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
                            userID={props.userID}//TODO:pass the user id to this component
                            handndleShowModal={handndleShowJobModal}
                            handleApplicationStatus={handleApplicationStatus}
                            handleUpdate={handleUpdate}
                        />

                    </Modal>
                    <div className="allRecommendedJobs">{allJobs}</div>
                </div>)}
        </div>
    );
}

export default RecommendedJobs;
