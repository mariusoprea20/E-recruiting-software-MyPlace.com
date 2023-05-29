import React, { useState } from 'react';
import "./jobseekerCSS/jobalert.css";

function JobAlert(props) {

    const [jobName, setJobName] = useState("");//set job name
    const [jobType, setJobType] = useState("");//set job type
    const [jobCity, setJobCity] = useState("");//set job city
    const token = localStorage.getItem('token');//get the token
    const [minSalary, setMinSalary] = useState(0);//get the minimum salary
    const [maxSalary, setMaxSalary] = useState(0);//get the maximum salary

    //upload new job alert to the database
    const handleJobAlert = () => {
        //check if the input fields aren't empty
        if (jobName === "" || jobType === "" || jobCity === "" || minSalary === 0 || maxSalary === 0) {
            alert("Please complete all fields before creating this alert!");
            //return null if empty fields
            return;
        }

        //if maximum of alerts completed, return null
        if (props.countJobPref > 5) {
            alert("You are allowed to set only 5 job alerts!")
            return;
        }

        const dataForm = new FormData();
        dataForm.append('userid', props.userID);
        dataForm.append('jobName', jobName);
        dataForm.append('jobType', jobType);
        dataForm.append('jobCity', jobCity);
        dataForm.append('minSalary', minSalary);
        dataForm.append('maxSalary', maxSalary);
        const confirmed = window.confirm('Do you want create a new job alert?');
        if (confirmed) {
            fetch("http://unn-w20039534.newnumyspace.co.uk/myplace/php/createjobpreferences", {
                method: "POST",
                headers: new Headers({ Authorization: "Bearer " + token }),
                body: dataForm
            })
                .then((response) => response.json())
                .then(
                    (json) => {
                        if (json.message === "success") {
                            props.handleUpdate();
                            alert("Job Alert Created!");//alert when the job was created
                            setJobName("");//reset the job name
                            setJobCity("");//reset the job city
                        }
                    }
                )
                .catch((e) => { console.log(e.message()) })
        }
    }//end

    //delete the job preferences from the database
    const handleDeleteAlert = (alertid) => {
        const dataForm = new FormData();
        dataForm.append('jobprefid', alertid);
        const confirmed = window.confirm('Delete this job alert?');
        if (confirmed) {
            fetch("http://unn-w20039534.newnumyspace.co.uk/myplace/php/removejobpreferences", {
                method: "POST",
                headers: new Headers({ Authorization: "Bearer " + token }),
                body: dataForm
            })
                .then((response) => response.json())
                .then(
                    (json) => {
                        if (json.message === "success") {
                            props.handleUpdate();//update the useEffect
                            alert("Job Alert Deleted!");//alert the user
                        }
                    }
                )
                .catch((e) => { console.log(e.message()) })
        }

    }//end

    //handle the job name
    const handleJobName = (event) => {
        setJobName(event.target.value);
    }

    //handle the job type
    const handleJobType = (event) => {
        setJobType(event.target.value);
    }

    //handle the job city
    const handleJobCity = (event) => {
        setJobCity(event.target.value);
    }

     //enter salary range and parse it to int 0-9 values only 
    //split the values into an array with two elements  from the select object
    const handleSalary = (event) => {
        //split the value into array of numbers
        const salaryRange = event.target.value.split('-');
        setMinSalary(parseInt(salaryRange[0], 10));
        setMaxSalary(parseInt(salaryRange[1], 10));
    }

    //iterate over jobPreferencesList and display all job preferences
    const jobAlerts = props.jobPreferencesList.map(
        (value) => {
            return (
                <div key={value.pref_id}>
                    <div className='jobAlertList'>
                        <h4>{value.job_name}</h4>
                        <p>{value.job_type}</p>
                        <p>{value.job_city}</p>
                        <p>Salary between: £{value.minSalary} - £{value.maxSalary}</p>
                        <button onClick={() => handleDeleteAlert(value.pref_id)}>Delete Alert</button>
                    </div>
                </div>
            );
        }
    );

    return (
        <div className="jobAlert">
            <div className="jobAlertsInputs">
                {/**Display the input fields */}
                <input
                    type="text"
                    placeholder="Job Name"
                    value={jobName}
                    onChange={handleJobName}
                />
                <input
                    type="text"
                    placeholder="Job City"
                    value={jobCity}
                    onChange={handleJobCity}
                />
                {/**jobtype */}
                <div className="jobAlerType">
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
                {/**salary range */}
                <div className="jobAlertSalary">
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
                <button onClick={handleJobAlert}>Create Alert</button>
            </div>
            {/**Display all job alerts */}
            <div className="displayJobAlerts">
                {jobAlerts}
            </div>
        </div>
    );

}
export default JobAlert;