import React, { useState, useEffect } from 'react';
import CreateJobs from './CreateJobs.js';
import EmployerJob from "./EmployerJob.js";
import EmployeeSearch from './EmployeeSearch.js'
import JobApplications from './JobApplications.js';
import Image from 'react-bootstrap/Image'
import ChatApp from '../../ChatApp.js';
import { useNavigate } from 'react-router-dom';
import { collection, query, where, onSnapshot, orderBy } from "firebase/firestore";
import { db } from "../../firebase-config.js";
import "./employerCSS/employerdashboard.css";

function EmployerDashboard(props) {
  const [firstName, setFirstName] = useState(props.firstName); //retrieve the first name of the user
  const [showJobForm, setShowJobForm] = useState(false); // job form flag to display the job form
  const [searchEmployee, setSearchEmployee] = useState(false);
  const [displayApplications, setDisplayApplications] = useState(false);
  const [updated, setUpdated] = useState(0);//update the useEffect
  const [displayChat, setDisplayChat] = useState(false); //flag to display the chat app
  const handleUpdate = () => { setUpdated(updated + 1) }//handle the update
  const navigate = useNavigate(); // invoke the navigation hook 
  const [newMessages, setNewMessages] = useState("");//store a message notification when a new message from jobseeker is received
  const [countApplications, setCountApplications] = useState("");//store the applications made by jobseekers
  const [profileImageUrl, setProfileImageUrl] = useState("");


  /**
 * Get the newest messages from the chat.
 * This useeffect retrieves the latest messages that comes from jobseekers
 * and sets 'newMessages' to display a message on the Chat button
 */
  useEffect(() => {
    const messagesRef = collection(db, "messages");// create reference to the message collection
    const employerRoomPrefix = props.userid + ":";// store the job seeker room prefix

    //create the query for the firebase by the room and createdAt timestamp
    const queryMessages = query(
      messagesRef,
      // room field of the message document should be alphabetical greater than the employerRoomPrefix
      where("room", ">", employerRoomPrefix),
      // room field of the message document should be alphabetical smaller than the employerRoomPrefix
      // '~'fetch messages with room starting with employerRoomPrefix 
      where("room", "<", employerRoomPrefix + "~"),
      //order by room
      orderBy("room"),
      //timestamp filter
      orderBy("createdAt")
    );
    //sets up onSnapshot listener to receive real-time updates whenever a change in the query results is made
    const unsubscribe = onSnapshot(queryMessages, (snapshot) => {
      let isNew = false;//set boolean flag
      const lastMessageByRoom = {};// set the object list
      //It iterates through the changes in the snapshot using the foreach loop
      snapshot.docChanges().forEach((change) => {
        //if change type is added
        if (change.type === "added") {
          //get the message data
          const messageData = change.doc.data();
          //get the room
          const room = messageData.room;
          //if the room id starts with the employerid 
          if (room.startsWith(employerRoomPrefix)) {
            //get the sender type
            const senderType = messageData.userType;
            //store room-sendertype
            lastMessageByRoom[room] = senderType; // Update last message userType for the room
          }
        }
      });
      // Check if there's at least one room with a last message userType of "jobseeker"
      isNew = Object.values(lastMessageByRoom).some((userType) => userType === "jobseeker");
      //if there is, set newMessage to 'received' and display it on the CHAT button
      if (isNew) {
        setNewMessages("received");
      } else {
        setNewMessages("");
      }
    });

    return () => unsubscribe;
  }, [props.userid]);//end


  /**
   * get all applications made by jobseekers on the logged employer's jobs set the number of applications
   * and store it in the countApplications to be displayed on the Applications button
   */
  useEffect(() => {
    fetch("http://unn-w20039534.newnumyspace.co.uk/myplace/php/applicationcounter?userid=" + props.userid)
      .then((response) => response.json())
      .then((json) => {
        if (json.message === "success") {
          let thiscount = 0;
          json.data.forEach(
            (item) => {
              if (item.status == "new") {
                thiscount += 1;
              }
            }
          );
          if (thiscount > 0) {
            setCountApplications("("+thiscount+")");
          }
        }
      })
      .catch((e) => {
        console.log(e.message);
      });
  }, [updated]);//end



  //update the profile image with the new one if the user changed the profile image in the profile page
  useEffect(() => {
    const fetchProfileImage = () => {
      //prevent caching issues, as the URL is different every time the fetchProfileImage is called
      // and force the browser to fetch the latest image using timestamp and passing the current time
      setProfileImageUrl(
        "http://unn-w20039534.newnumyspace.co.uk/myplace/php/profileimage?userid=" + props.userid + '&timestamp=' + new Date().getTime()
      );
    };

    fetchProfileImage();

  }, []);

  //close the other components and display the job form
  const handleJobForm = () => {
    setShowJobForm(!showJobForm)
    setSearchEmployee(false);
    setDisplayApplications(false);
    setDisplayChat(false);
  }

  // handle the chat
  const handleChatClick = () => {
    let searchParams = ""; // initialise the parameters

    if (props.userid) {
      searchParams += `loggedUser=${props.userid}`;
    }

    //navigate to chat private route 
    navigate(`/chat?${searchParams}`);
  };

  //handle the home button. Close all elements when home button is pressed
  const handleHome = () => {
    setShowJobForm(false)
    setSearchEmployee(false);
    setDisplayApplications(false);
    setDisplayChat(false);
  }

  //when search button is pressed, display the search page
  const handleSearch = () => {
    // Code to show job alerts goes here
    setSearchEmployee(true);
    setShowJobForm(false);
    setDisplayApplications(false);
    setDisplayChat(false);

  };

  const handleJobApplications = () => {
    setDisplayApplications(true);
    setShowJobForm(false);
    setSearchEmployee(false);
    setDisplayChat(false);
  };

  return (
    <div className="gridContainerEmp">
      {/**side panel on the main page */}
      <div className='sidePanelEmp'>
        <div className="profile-imageEmp">
          <Image src={profileImageUrl}
            fluid={true}
            roundedCircle={true}
            thumbnail={true}
            style={{ width: '150px', height: '150px', objectFit: 'cover' }}
            />
          <div><b>{firstName}</b></div>
        </div>
        {/**buttons to handle the dashboard page */}
        <button onClick={handleHome}>Home</button>
        <button onClick={handleSearch}>Search</button>

        {/**button Applicants set to be alligned with the 'countApplications'*/}
        <button onClick={handleJobApplications} style={{ display: 'flex', flexDirection: "row" }}>
          Applicants
          <p style={{ fontSize: '16px', margin: 0, marginLeft: '5px', color: "lightGreen" }}>{countApplications}</p>
        </button>

        {/**button chat set to be alligned with the 'newMessage'*/}
        <button onClick={handleChatClick} style={{ display: 'flex', alignItems: 'center' }}>
          Chat
          <p style={{ fontSize: '12px', margin: 0, marginLeft: '5px', color: "lightGreen" }}>{newMessages}</p>
        </button>

        <br />
        <br />
        <br />
        {/**log out the user using props.handleLogOut from the Login.js */}
        <button onClick={props.handleLogOut}>Log out</button>
      </div>
      {/**Button "Create Jobs" to display the job form*/}
      <div className="myJobs">
        {/**if no component from the dashboard is clicked, display title and button to create jobs  */}
        {!searchEmployee && !showJobForm && !displayApplications && <h4>My Jobs</h4>}
        {!searchEmployee && !showJobForm && !displayApplications &&
          <button style={{
            float: "right",
            marginTop: "-3%",
            backgroundColor: '#3f51b5',
            borderRadius: "20px",
            color: 'white',
            padding: '14px 20px',
            border: 'none',
            cursor: 'pointer'
          }}
            onClick={handleJobForm}
          ><b>+</b>Create Job</button>}
        {/** if showJobForm true, display the job form to create the jobs*/}
        {showJobForm && <div><CreateJobs handleJobForm={handleJobForm} userid={props.userid} handleUpdate={handleUpdate} /></div>}
        {/** if displayApplications, searchEmployee and showJobForm are false, display all the jobs created by the user*/}
        {!searchEmployee && !showJobForm && !displayApplications && <div><EmployerJob userid={props.userid} handleUpdate={handleUpdate} updated={updated} /></div>}
        {/** if searchEmployee is true, display the search component*/}
        {searchEmployee && <EmployeeSearch userid={props.userid} />}
        {/**if displayApplications is true, display all applicants of this user's jobs*/}
        {displayApplications && <JobApplications userid={props.userid} />}
        {displayChat && <ChatApp />}
      </div>
    </div>
  );
}

export default EmployerDashboard;