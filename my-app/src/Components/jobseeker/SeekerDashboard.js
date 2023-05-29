import React, { useState, useEffect } from 'react';
import RecommendedJobs from './RecommendedJobs.js';
import { useNavigate } from 'react-router-dom';
import JobAlert from './JobAlert.js';
import SavedJobs from './SavedJobs.js';
import Image from 'react-bootstrap/Image';
import { collection, query, where, onSnapshot, orderBy } from "firebase/firestore";
import { db } from "../../firebase-config.js";
import "./jobseekerCSS/jobseekerdashboard.css"

function SeekerDashboard(props) {

  const [firstName, setFirstName] = useState(props.firstName);//set the first name from the props
  const [updated, setUpdated] = useState(0); //define an update variable to update the useEffect()
  const handleUpdate = () => { setUpdated(updated + 1) }//function to update the "updated"
  const navigate = useNavigate(); // invoke the navigation hook 
  const [searchJobTitle, setSearchJobTitle] = useState(""); // used to store the job title
  const [searchLocation, setSearchLocation] = useState(""); // used to store the job location
  const [jobPreferencesList, setJobPreferencesList] = useState([]); // store the job preferencesList
  const [alertClicked, setAlertClicked] = useState(false);//flag to display the job alert component
  const [displaySavedJobs, setDisplaySavedJobs] = useState(false); //flag to display the saved jobs
  const [countJobPref, setCountJobPref] = useState(0);//used to set the limit of the job preferences
  const handleCountJobPref = () => { setCountJobPref(countJobPref + 1) } //used to set the limit of the job preferences
  const [newMessages, setNewMessages] = useState(""); // set the new message when a message is received from the employer
  const [profileImageUrl, setProfileImageUrl] = useState("");//set profile image


  /**
   * Get the newest messages from the chat.
   * This useeffect retrieves the latest messages that comes from employers
   * and sets 'newMessages' to display a message on the Chat button
   */
  useEffect(() => {
    const messagesRef = collection(db, "messages"); // create reference to the message collection
    const jobseekerRoomPrefix = ":" + props.userid; // store the job seeker room prefix

    //create the query for the firebase by the room and createdAt timestamp
    const queryMessages = query(
      messagesRef,
      // room field of the message document should be alphabetical smaller than the jobseekerRoomPrefix
      // '~'fetch messages with room end with jobseekerRoomPrefix 
      where("room", "<", jobseekerRoomPrefix + "~"),
      //order by room
      orderBy("room"),
      //timestamp filter
      orderBy("createdAt")
    );
    //sets up onSnapshot listener to receive real-time updates whenever a change in the query results is made
    const unsubscribe = onSnapshot(queryMessages, (snapshot) => {
      let isNew = false; //set boolean flag
      const lastMessageByRoom = {}; // set the object list
      //It iterates through the changes in the snapshot using the foreach loop
      snapshot.docChanges().forEach((change) => {
        //if change type is added
        if (change.type === "added") {
          //get the message data
          const messageData = change.doc.data();
          //get the room
          const room = messageData.room;
          //if the room id ends with the jobseekerid 
          if (room.endsWith(jobseekerRoomPrefix)) {
            //get the sender type
            const senderType = messageData.userType;
            //store room-sendertype
            lastMessageByRoom[room] = senderType;
          }
        }
      });

      // Check if there's at least one room with a last message userType of "employer"
      isNew = Object.values(lastMessageByRoom).some((userType) => userType === "employer");
      //if there is, set newMessage to 'received' and display it on the CHAT button
      if (isNew) {
        setNewMessages("received");
      } else {
        setNewMessages("");
      }
    });
    //clear the unsubscribe once done
    return () => unsubscribe;
  }, [props.userid]);//end



  //update the profile image with the new one if the user changed the profile image in the profile page
  useEffect(() => {
    const fetchProfileImage = () => {
      setProfileImageUrl(
        //prevent caching issues, as the URL is different every time the fetchProfileImage is called
        // and force the browser to fetch the latest image using timestamp and passing the current time
        "http://unn-w20039534.newnumyspace.co.uk/myplace/php/profileimage?userid=" + props.userid + '&timestamp=' + new Date().getTime()
      );
    };

    fetchProfileImage();

  }, []);

  //retrieve all the existing job preferences of this  user
  useEffect(() => {
    fetch("http://unn-w20039534.newnumyspace.co.uk/myplace/php/jobpreferences?userid=" + props.userid)
      .then((response) => response.json())
      .then((json) => {
        setJobPreferencesList(json.data);
        //count how many job preferences exists already
        json.data.forEach(
          (item) => {
            //update the counter
            handleCountJobPref()
          }
        );
      })
      .catch((e) => {
        console.log(e.message);
      });
  }, [updated]);//end


  // handle the chat button
  const handleChatClick = () => {
    let searchParams = ""; // initialise the parameters

    if (props.userid) {
      searchParams += `loggedUser=${props.userid}`;
    }

    //navigate to chat private route 
    navigate(`/chat?${searchParams}`);
  };

  //handle the job alert button
  const handleJobAlertClick = () => {
    setAlertClicked(true);
    setDisplaySavedJobs(false);
  };

  //handle the home page button
  const handleHomePage = () => {
    setAlertClicked(false);
    setDisplaySavedJobs(false);

  };

  //handle the saved jobs button
  const handleSavedJobsClick = () => {
    setDisplaySavedJobs(true);
    setAlertClicked(false);
  };

  //get the job title user input
  const handleJobSearch = (event) => {
    setSearchJobTitle(event.target.value);
  };
  //get the job location user input
  const searchByLocation = (event) => {
    setSearchLocation(event.target.value);
  };

  //handle the search on the main page
  const handleSearch = () => {
    let searchParams = ""; // initialise the parameters
    /**
     * If user entered the job title in the job search bar,
     * add the value as optional  parameter for the url
     */
    if (searchJobTitle) {
      searchParams += `jobTitleDash=${searchJobTitle}`;
    }
    /**
     * if user entered the location into the location search bar,
     * check if the job title parameter has been added or not.
     * If job title parameter added use "&", else only add location
     * as parameter.
     */
    if (searchLocation) {
      searchParams += (searchParams ? "&" : "") + `locationDash=${searchLocation}`;
    }
    //navigate to job search private route 
    navigate(`/searchJobs?${searchParams}`);
  };

  return (
    <div className="gridContainer">
      {/**Define the search input on the top of the page for job title and location */}
      <div className="topInput"  >
        <input type="text"
          placeholder="Job Title"
          style={{
            borderRadius: "20px",
            width: '40%',
            padding: '12px 20px',
            margin: '8px 5px 8px 1px',
            border: '1px solid #ccc',
            boxSizing: 'border-box'
          }}
          onChange={handleJobSearch} />

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
          onChange={searchByLocation} />
        <button
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
      </div>{/**end */}

      {/**define the side panel of the dashboard page */}
      <div className='sidePanelSeeker'>
        <div className="seekerProfileImg">
          {/**Get the current profile image on the side dashboard */}
          <Image src={profileImageUrl}
            style={{  width: "160px", height: "150px" }}
            fluid={true}
            roundedCircle={true}
            thumbnail={true} />
          <div><b>{firstName}</b></div>
        </div>
        {/**define the side panel buttons */}
        <button onClick={handleHomePage}>Home</button>
        <button onClick={handleJobAlertClick}>Job Alert</button>
        <button onClick={handleSavedJobsClick}>Saved Jobs</button>
        {/**button chat set to be alligned with the 'newMessage'*/}
        <button onClick={handleChatClick} style={{ display: 'flex', alignItems: 'center' }}>
          Chat
          <p style={{ fontSize: '12px', margin: 0, marginLeft: '5px', color: "lightGreen" }}>{newMessages}</p>
        </button>
        <br />
        <br />
        <br />
        <button onClick={props.handleLogOut}>Log out</button>
      </div>

      {/**if user clicks on Job Alerts, display Job Alert Component */}
      {alertClicked && !displaySavedJobs && <div className='jobAlertComponent'>
        <JobAlert userID={props.userid} jobPreferencesList={jobPreferencesList} handleUpdate={handleUpdate} countJobPref={countJobPref} />
      </div>}

      {!alertClicked && !displaySavedJobs && <div className="recomendedJobs">
        <div><RecommendedJobs jobPreferencesList={jobPreferencesList} userID={props.userid} /></div>
      </div>
      }
      {/**display the saved jobs if saved jobs button clicked */}
      {displaySavedJobs && !alertClicked && <div className="userSavedJobs">
        <SavedJobs userID={props.userid} />
      </div>
      }
    </div>
  );
}

export default SeekerDashboard;