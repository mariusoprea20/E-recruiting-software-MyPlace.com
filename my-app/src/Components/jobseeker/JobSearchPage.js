import React, { useEffect, useState } from 'react';
import { useParams, useSearchParams } from "react-router-dom";
import JobApplication from './JobApplication.js';
import Modal from 'react-modal';
import Image from 'react-bootstrap/Image';
import "./jobseekerCSS/jobsearchpage.css";
import { Spinner } from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';

// get the html element with id 'rootX' and assign it to'appElement'
const appElement = document.getElementById('rootX');
// set the app element for the Modal component to 'appElement'
// this tells the Modal component where it should be rendered
Modal.setAppElement(appElement);

function JobSearchPage(props) {
    const [loadingJobs, setLoadingJobs] = useState(true);//loading job state
    const [loadingSavedJobs, setLoadingSavedJobs] = useState(true);//loading saved jobs
    const [searchParams] = useSearchParams(); // search for the parameters sent from SeekerDashboard
    const jobTitleDash = searchParams.get("jobTitleDash") || ""; // assign the job title param from dashboard or set it to empty
    const locationDash = searchParams.get("locationDash") || ""; // assign the job location param from dashboard or set it to empty
    const [initialJobTitle, setInitialJobTitle] = useState(jobTitleDash); //add the params to the use state initialJobTitle
    const [initialJobLocation, setInitialJobLocation] = useState(locationDash);//add the params to the use state initialJobLocation
    const [showJobModal, setShowJobModal] = useState(false); //display modal {false}
    const [currentJob, setCurrentJob] = useState(null); //store the current job when user clicks apply
    const [jobDetails, setJobDetails] = useState([]);//store all jobs in jobDetail state
    const [userID, setUserID] = useState(0);//store user id here
    const [applicationsMade, setApplicationsMade] = useState([]); // set all job applications made by this user

    // object to store all job applications in real time and display "succesfull message" when user just applied for the job
    const [appliedJobs, setAppliedJobs] = useState({});
    const [filteredJobData, setFilteredJobData] = useState([]); //array to stored the filter data and map all elements in JSX
    const [displayJobResult, setDisplayJobResult] = useState(false); //display data when the user search .. boolean flag
    const [savedJobsList, setSavedJobsList] = useState([]); // store all the saved jobs made by this user
    const [applicationDatesByJobId, setApplicationDatesByJobId] = useState({});// store all application dates as key-value objects[jobid: applicationDates]
    const token = localStorage.getItem("token"); //get the stored jwt token
    const currentDate = new Date();//get current date
    const options = { day: 'numeric', month: 'numeric', year: 'numeric' };//set the format
    const applicationDate = currentDate.toLocaleDateString('en-US', options); // store the current formatted date
    const [updated, setUpdated] = useState(0); //update the useEffect hooks
    const handleUpdate = () => { setUpdated(updated + 1) } // handle update for useEffect
    const [isExistingCV, setIsExistingCV] = useState(false); // check if the user previously attached a CV
    const [cvErrorModal, setCVErrorModal] = useState(false); //display cv error modal
    const imgUrl = "http://unn-w20039534.newnumyspace.co.uk/myplace/php/profileimage?userid="; // store the URL of the image endpoint
    //retrieve user input in searchTerm useState
    const [searchTerm, setSearchTerm] = useState({
        jobTitle: initialJobTitle, //pass the job title params or ""
        location: initialJobLocation,//pass the job location params or ""
        jobType: '',
        salary: '',
        postedDate: ''
    });

    //TODO: create an endpoint that checks if the user has a cv in the database
    //fetch the response of isCV in the database.
    //isCV returns true or false depending if the value of CV in the database is null or not
    useEffect(() => {
        fetch("http://unn-w20039534.newnumyspace.co.uk/myplace/php/cvretrievel", {
            method: "POST",
            headers: new Headers({ Authorization: "Bearer " + token }),
        })
            .then((response) => response.json())
            .then((json) => {
                //true or false value
                setIsExistingCV(json.isCV);
            })
            .catch((e) => {
                console.log(e.message);
            });
    }, []);

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
                    //retrieve also the userid
                    setUserID(json.userid);
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
    }, [updated]);

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
                setLoadingSavedJobs(false); //saved jobs loaded
            })
            .catch((e) => {
                console.log(e.message);
            });
    }, [updated]);

    //use a useEffect to retrieve all jobs from database
    useEffect(() => {
        fetch("http://unn-w20039534.newnumyspace.co.uk/myplace/php/job")
            .then((response) => response.json())
            .then(
                (json) => {
                    if (json.message === "success") {
                        //store all job details
                        setJobDetails(json.data);
                    }
                    setLoadingJobs(false);//all jobs loaded
                }
            )
            .catch((e) => {
                console.log(e.message());
            })
    }, [])

    /**
     * This function allows user to fast apply.
     * 1. retrieve the job id from filteredJobData.map() and userID and append them to a FormData()
     * 2.fetch the existing stored CV from the database and append it to the FormData()
     * 3.append the current formatted date
     * 4.send FormatData() to the endpoint to create the application in the database
     * 5. if successfully crated, update the appliedJob to display "success" message on the applied job advert
     */
    const handleFastApply = async (job) => {

        //if no cv was found, display error message
        if (isExistingCV === false) {
            openCVErrorModal();
            return;
        }
        //create form data and ad job id and userid
        const dataForm = new FormData();
        dataForm.append("jobid", job.job_id);
        dataForm.append("userid", userID);
        try {
            //fetch the cv from the database
            const response = await fetch(`http://unn-w20039534.newnumyspace.co.uk/myplace/php/displaycv?userid=${userID}`);
            //await the file response(set in database as blob)
            const blob = await response.blob();
            //convert cv from blob to file and set the type to pdf
            const file = new File([blob], "cv.pdf", { type: "application/pdf" });
            //append cv to dataForm
            dataForm.append("file", file);
        } catch (error) {
            console.error("Error fetching the PDF:", error);
            return;
        }
        //append the current date
        dataForm.append("applicationDate", applicationDate);
        //confirm with user the application
        const confirmed = window.confirm('Do you want to apply for this job?');
        if (confirmed) {
            fetch("http://unn-w20039534.newnumyspace.co.uk/myplace/php/createapplication", {
                method: "POST",
                headers: new Headers({ Authorization: "Bearer " + token }),
                body: dataForm
            })
                .then((response) => response.json())
                .then(
                    (json) => {
                        if (json.message === "success") {
                            console.log("applied")
                            //update the appliedJobs state
                            setAppliedJobs({ ...appliedJobs, [job.job_id]: true });
                            handleUpdate();
                        }
                    }
                )
                .catch((e) => { console.log(e.message()) })
        }
    } //end

    /**
     * function used in filteredJobData.map() for saving the job.
     * 1. Get job id and user id
     * 2. pass them to the endpoint
     * 3.update states
     */
    const handleSavedJob = (job) => {
        const dataForm = new FormData();
        dataForm.append("jobid", job.job_id);
        dataForm.append("userid", userID);

        fetch("http://unn-w20039534.newnumyspace.co.uk/myplace/php/createjobsave", {
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
    } // end

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

    /**
     * function passed to JobApplication Component to display "succesfull message" if job was applied
     * updates the appliedJobs
     */
    const handleApplicationStatus = (jobid, status) => {
        setAppliedJobs({ ...appliedJobs, [jobid]: status });
    };

    //open Error pop up window when User applies with no cv
    function openCVErrorModal() {
        setCVErrorModal(true);
    }
    //close CV error pop up window
    function closeCVErrorModal() {
        setCVErrorModal(false);
    }
    /**
     * function passed to JobApplication Component to close the Modal
     * updates the appliedJobs
     */
    const handndleShowJobModal = (value) => {
        setShowJobModal(value);
    }

    // New function to handle the Apply button click
    //sets the current job when user clicks apply  and displays the Modal with JobApplication Component 
    const handleApply = (job) => {
        setCurrentJob(job);
        setShowJobModal(true);
    };


    //handle each user input {...searchTerm to load previous array element values and update only values needed}
    //when user types in the input box, initialJobTitle is set to "", so the value can be updated in searchTerm.jobTitle
    const handleJobTitle = (event) => { //tod
        setInitialJobTitle("");
        setSearchTerm({ ...searchTerm, jobTitle: event.target.value });
    }
    //handle each user input {...searchTerm to load previous array element values and update only values needed}
    //when user types in the input box, initialJobLocation is set to "", so the value can be updated in searchTerm.location
    const handleLocation = (event) => {
        setInitialJobLocation("");
        setSearchTerm({ ...searchTerm, location: event.target.value });
    }
    //handle each user input {...searchTerm to load previous array element values and update only values needed}
    const handleJobType = (event) => {
        setSearchTerm({ ...searchTerm, jobType: event.target.value });
    }
    //enter salary range and parse it to int 0-9 values only 
    //split the values into an array with two elements  from the select object
    const handleSalary = (event) => {
        //split the value into array of numbers
        const salaryRange = event.target.value.split('-');
        //update searchTerm
        setSearchTerm({
            ...searchTerm,
            salary: {
                min: parseInt(salaryRange[0], 10),
                max: parseInt(salaryRange[1], 10)
            }
        });
    }

    //split the values into an array with two elements  from the select object
    //set max date to current date
    //set min date to current date - the dateRange from the select object
    const handlePostedDate = (event) => {
        //split the value into an array of dates
        const dateRange = event.target.value.split('-');
        const currentDate = new Date();
        //get the minimum date by decreasing current date to the date the jobs were applied
        let minDate = currentDate.setDate(currentDate.getDate() - dateRange[1]);
        //update search
        setSearchTerm({
            ...searchTerm,
            postedDate: {
                min: new Date(minDate),
                max: new Date()
            }
        });
    }

    // Pass the jobTitle and location to the search functions
    //this functions are used only for allUnfilteredJobs
    const searchJobTitleDashboard = (value) => {
        return jobTitleDash ? value.job_name.toLowerCase().includes(jobTitleDash.toLowerCase()) : true;
    }
    const searchLocationDashboard = (value) => {
        return locationDash ? value.job_city.toLowerCase().includes(locationDash.toLowerCase()) : true;
    }///end

    //search job by job title
    const searchJobTitle = (value) => {
        return searchTerm.jobTitle ? value.job_name.toLowerCase().includes(searchTerm.jobTitle.toLowerCase()) : true;
    }
    //search job by job location
    const searchLocation = (value) => {
        return searchTerm.location ? value.job_city.toLowerCase().includes(searchTerm.location.toLowerCase()) : true;
    }
    //search job by job type
    const searchJobType = (value) => {
        return searchTerm.jobType ? value.job_type.toLowerCase().includes(searchTerm.jobType.toLowerCase()) : true;
    }
    //search job by job salary
    const searchSalary = (value) => {
        //if no salary entered, return true
        if (!searchTerm.salary) {
            return true;
        }
        //get the minimum and maximum salary range from searchTerm.salary array
        const { min, max } = searchTerm.salary; //destructuring
        const salary = parseFloat(value.job_salary); //parse salary of the existin jobs
        return (!isNaN(salary) && salary >= min && salary <= max); // is a number and within the range
    }
    //search jobs by posted dates
    const searchPostedDate = (value) => {
        //retrun true if date range not selected
        if (!searchTerm.postedDate) {
            return true;
        }
        //get the min and max range dates from searchTerm.postedDate
        const { min, max } = searchTerm.postedDate;//destructuring
        const datePosted = new Date(value.job_datePosted);
        return (!isNaN(datePosted.getTime()) && datePosted >= min && datePosted <= max);// is a number and within the range
    }
    //function to filter all jobs  and store the filtered data in filteredJobData usestate
    const handleSearch = () => {
        setFilteredJobData(jobDetails.filter(searchJobTitle).filter(searchLocation).filter(searchJobType).filter(searchSalary).filter(searchPostedDate));
        setDisplayJobResult(true);
    }
    //display all data in jsx if the user search in JobSearchComponent
    const allJobs = filteredJobData.map(
        (value) => {
            /**
             * isJobApplied assigned with true of false if the existing application on the current job is done.
             * some() returns true or false
             */
            const isJobApplied = applicationsMade.some((application) => application.job_id === value.job_id);
            //check if the job ids from the were previously saved and return true or false
            const preSavedJob = savedJobsList.some((saved) => saved === value.job_id);
            return (
                <div key={value.job_id}>
                    <div className="listOfJobs">
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
                            <p>Job Salary: £{value.job_salary}</p>
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
                            <div className="jobInterfaceButtons">
                                <button onClick={() => handleFastApply(value)}>1-Click Apply</button>
                                {/**Display modal when the user clicks on the Apply button */}
                                <button onClick={() => handleApply(value)}>Apply</button>
                                {/**if the job was previously saved, display "Unsave button" else display "Save button" */}
                                {preSavedJob === true ? <button onClick={() => handleUnsave(value)}>Unsave</button> : <button onClick={() => handleSavedJob(value)}>Save</button>}
                            </div>
                        )}
                    </div>
                </div>
            );
        }
    );
    //display job data that was searched from SeekerDashboard by retrieving the params and filtering jobDetails
    const allUnfilteredJobs = jobDetails.filter(searchJobTitleDashboard).filter(searchLocationDashboard).map(
        (value) => {
            /**
             * isJobApplied assigned with true of false if the existing application on the current job is done.
             * some() returns true or false
             */
            const isJobApplied = applicationsMade.some((application) => application.job_id === value.job_id);
            //check if the job ids from the were previously saved and return true or false
            const preSavedJob = savedJobsList.some((saved) => saved === value.job_id);
            return (
                <div key={value.job_id}>
                    <div className="listOfFilteredJobs">
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
                            <p>Job Salary: £{value.job_salary}</p>
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
                            <div className="jobInterfaceButtons">
                                <button onClick={() => handleFastApply(value)}>1-Click Apply</button>
                                {/**Display modal when the user clicks on the Apply button */}
                                <button onClick={() => handleApply(value)}>Apply</button>
                                {/**if the job was previously saved, display "Unsave button" else display "Save button" */}
                                {preSavedJob === true ? <button onClick={() => handleUnsave(value)}>Unsave</button> : <button onClick={() => handleSavedJob(value)}>Save</button>}
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
        {loadingJobs || loadingSavedJobs ? (
            <h4 className="d-flex justify-content-center" style={{ marginTop: '20%' }}>
                <Spinner animation="border" role="status">
                </Spinner>
                <span> Loading Data...</span>
            </h4>
        ) : (
            <div className="jobSearchPage">
                {/** Display an Modal with error message */}
                <div className="erroModalCV">
                    <Modal
                        isOpen={cvErrorModal}
                        style={{
                            content: {
                                width: "40%",
                                height: "20%",
                                marginTop: "20%",
                                marginLeft: "30%",
                                backgroundColor: "#62B1F6"
                            }
                        }}>
                        <h6>No CV Found. Upload your personal CV first!</h6>
                        <button onClick={closeCVErrorModal}> Close</button>
                    </Modal>
                </div>
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
                        userID={userID}
                        handndleShowModal={handndleShowJobModal}
                        handleApplicationStatus={handleApplicationStatus}
                        handleUpdate={handleUpdate}
                    />
                </Modal>
                <div className="allInputsTop">
                    {/* Job Title Search box.
                        * takes value from the keyboard or
                        * sets the value to params sent via URL from SeekerDashboard
                        */}
                    <div className="topInputs"  >
                        <input className="titleJobSearch"
                            type="text"
                            placeholder="Job Title"
                            style={{
                                borderRadius: "20px",
                                width: '40%',
                                padding: '12px 20px',
                                margin: '8px 5px 8px 1px',
                                border: '1px solid #ccc',
                                boxSizing: 'border-box'
                            }}
                            value={searchTerm.jobTitle || initialJobTitle}
                            onChange={handleJobTitle}
                        />
                        {/* Location  Search box.
                            * takes value from the keyboard or
                            * sets the value to params sent via URL from SeekerDashboard
                            */}
                        <input className="locationJobSearch"
                            type="text"
                            placeholder="Location"
                            style={{
                                borderRadius: "20px",
                                width: '40%',
                                padding: '12px 20px',
                                margin: '8px 5px 8px 1px',
                                border: '1px solid #ccc',
                                boxSizing: 'border-box'
                            }}
                            value={searchTerm.location || initialJobLocation}
                            onChange={handleLocation}
                        />
                        {/*Search button to handle the search*/}
                        <button
                            className="searchJobs"
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
                    {/* Job Type select component
                        * sets a disabled value to Job Type to show the use of it
                        */}
                    <div className="jobAllFilters">
                        <div className="jobTypeFilt">
                            <select
                                defaultValue='disabled' // defaulted value  for the select component acts as a placeholder 
                                onChange={handleJobType}
                            >
                                <option value='disabled' disabled hidden style={{ color: 'gray' }}>Job Type</option>
                                <option value='fulltime' style={{ fontSize: '20px' }}>Full Time</option>
                                <option value='part-time' style={{ fontSize: '20px' }}>Part-Time</option>
                                <option value='apprenticeship' style={{ fontSize: '20px' }}>Apprenticeship</option>
                            </select>
                        </div>
                        {/*Salary range component
                            *sets the default value to Salary Range to show the use of it
                            */}
                        <div className="salaryJobFilt">
                            <select
                                defaultValue="disabled"
                                onChange={handleSalary}
                            >
                                <option value="disabled" disabled hidden>Salary Range</option>
                                <option value="0-10000">up to £10.000</option>
                                <option value="10000-20000">£10.000 - £20.000</option>
                                <option value="20000-30000">£20.000 - £30.000</option>
                                <option value="30000-50000">£30.000 - £50.000</option>
                                <option value="50000-70000">£50.000 - £70.000</option>
                                <option value="70000-100000">£70.000 - £100.000</option>
                                <option value="100000-1000000">£100.000+</option>
                            </select>
                        </div>
                        {/*Dates component
                            *Sets default value to Date Posted to display the use of the component
                            */}
                        <div className="dateJobFilt">
                            <select
                                defaultValue="disabled"
                                onChange={handlePostedDate}
                            >
                                <option value="disabled" disabled hidden>Date posted</option>
                                <option value="0-1">Last 24h</option>
                                <option value="0-3">Last 3 days</option>
                                <option value="0-7">Last 7 days</option>
                                <option value="0-14">Last 14 days</option>
                                <option value="0-28">Last 28 days</option>
                            </select>
                        </div>
                    </div>
                </div>
                {/**
                 * Display job details.
                 * In handleSearch, displayJobResults is set to true.
                 * If displayJobResults=true{display all filtered data on JobSearchPage} else {display the unfiltered data}
                 */}
                {displayJobResult && (allJobs.length > 0 ? allJobs : <h4>Jobs not found!</h4>)}
                {!displayJobResult && (allUnfilteredJobs.length > 0 ? allUnfilteredJobs : <h4>Jobs not found!</h4>)}
            </div>)} {/**loading state ended */}
    </div>

);
}

export default JobSearchPage;