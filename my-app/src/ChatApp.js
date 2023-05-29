import React, { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import Image from 'react-bootstrap/Image'
import "./ChatApp.css";
import { addDoc, collection, serverTimestamp, onSnapshot, query, where, orderBy } from 'firebase/firestore';
import { db } from "./firebase-config";

function ChatApp(props) {
    const [searchParams] = useSearchParams(); // search for the parameters
    const loggedUser = searchParams.get("loggedUser") || ""; // if loggedUser found in the url, store it
    const guestuserid = searchParams.get("guestuserid") || "";// if guestuer found in the url, store it
    const [updated, setUpdated] = useState(0); //update the useEffect hooks
    const handleUpdate = () => { setUpdated(updated + 1) } // handle update for useEffect
    const token = localStorage.getItem("token"); //get the stored jwt token
    const [allRooms, setAllRoms] = useState([]);// get all rooms from the database
    // if params loggedUser and guestuerid are found in the url, create the active room
    const [activeRoom, setActiveRoom] = useState(guestuserid ? loggedUser + ":" + guestuserid : "");
    const [usersDetails, setUsersDetails] = useState([]);//store all users here
    const imgUrl = "http://unn-w20039534.newnumyspace.co.uk/myplace/php/profileimage?userid="; // get the candidate profile img
    const [isRoomCreated, setIsRoomCreated] = useState(false); //flag that detects if a room was already created in the database
    const [firstName, setFirstName] = useState("");//store the first name of the logged user
    const [lastName, setLastName] = useState("");//store the last name of the logged user
    const [newMessage, setNewMessage] = useState("");//set a new message to be sent
    const [messages, setMessages] = useState({});//store all the messages from firebase
    const reversedRoom = activeRoom.split(':').reverse().join(':');//reverse the room id
    const messagesRef = collection(db, "messages"); //message ref from firebase
    const [roomID, setRoomID] = useState(""); //get the room id when the room is clicked
    const [userType, setUserType] = useState(""); // store the usertype
    const [guestName, setGuestName] = useState("");//set the guest name
    const [isLoading, setIsLoading] = useState(true); //loading state


    /**
     * Retrieve all chat rooms(user_id:usertargetid) from the datgabase
     * and check them against the loggeduserid and guestuserid.
     * If they match, a chat room was already created and the isRoomCreated is set to true
     */
    useEffect(() => {
        setIsLoading(true);

        fetch("http://unn-w20039534.newnumyspace.co.uk/myplace/php/retrievechat", {
            method: "POST",
            headers: new Headers({ Authorization: "Bearer " + token })
        })
            .then((response) => response.json())
            .then((json) => {
                if (json.message === "success") {
                    setAllRoms(json.data); // set all rooms from the database
                    //iterate over each room in the database by checking the loggedUser and guestuserid with the ids from the database
                    json.data.forEach(
                        (item) => {
                            if ((item.user_id == loggedUser || item.usertargetid == loggedUser) &&
                                (item.user_id == guestuserid || item.usertargetid == guestuserid)) {
                                setIsRoomCreated(true);//room already exists in firebase and database
                            }
                        }
                    );
                    setIsLoading(false);
                }
            })
            .catch((e) => {
                console.log(e.message);
            });
    }, [updated]);//end


    //useEffect to retrieve all user data
    useEffect(() => {

        setIsLoading(true);

        fetch("http://unn-w20039534.newnumyspace.co.uk/myplace/php/user")
            .then(
                (response) => response.json()
            )
            .then(
                (json) => {
                    //set user details once json data is retrieved
                    setUsersDetails(json.data);
                    json.data.forEach(
                        (item) => {
                            if (item.user_id == guestuserid) {
                                setGuestName(item.firstName + " " + item.lastName);
                            }
                        }
                    );//check if this code is needed or not
                    setIsLoading(false);
                }
            )
            .catch((err) => {
                console.log(err.message);
            });

    }, []);//end

    //get the user details of the logged user
    //the userid of the loggeduser is decoded in the endpoint and retrieves all details related
    useEffect(
        () => {
            if (localStorage.getItem('token')) {

                //access the endpoing by sending the bearer token and formData through headers
                fetch("http://unn-w20039534.newnumyspace.co.uk/myplace/php/userauth",
                    {
                        //set the method
                        method: 'POST',
                        //set the bearer token
                        headers: new Headers({ "Authorization": "Bearer " + token })
                    })
                    .then(
                        (response) => response.json()
                    )
                    .then(
                        (json) => {
                            if (json.message === "success") {
                                setFirstName(json.data[0].firstName);
                                setLastName(json.data[0].lastName);
                                setUserType(json.data[0].user_type);
                            }
                        })
                    .catch(
                        (e) => {
                            console.log(e.message)
                        })
            }
        }
        , []);//end

    /**
     * Get all messages from the activeRoom or reversedRoom
     */
    useEffect(() => {
        //create the query with filters
        const queryMessages = query(messagesRef, where("room", "in", [activeRoom, reversedRoom]), orderBy("createdAt"));
        //iterate through the rooms and get the messages of the activeRoom
        const unsubscribe = onSnapshot(queryMessages, (snapshot) => {
            let roomMessages = [];
            snapshot.forEach((doc) => {
                roomMessages.push({ ...doc.data(), id: doc.id });
            });
            //store the conversations of the activeRoom as key-value
            setMessages((prevMessages) => ({ ...prevMessages, [activeRoom]: roomMessages }));
            //update everything
            handleUpdate();
        });

        return () => unsubscribe;
    }, [activeRoom, reversedRoom]);//end

    /**
     * handleChat opens an existing room by passing the user_id(employer) and usertargetid(jobseeker) to Chat.js
     */
    //set the the activeRoom to open the conversation
    const handleChat = (user_id, usertargetid, chatId) => {
        setActiveRoom(user_id + ":" + usertargetid);
        //store the current chatid in roomid
        setRoomID(chatId);
    };

    //handle all divs when user clicks on a particular room in listOfRooms
    function handleAllDivs(user_id, usertargetid, chatId) {
        //call handleChat
        handleChat(user_id, usertargetid, chatId);
        //Update the status in the database when clicking on the room
        updateChatStatus(chatId, "old", userType);
    }


    //call back function to display all rooms from the database
    const listOfRooms = allRooms.map((value) => {

        //get the value old or new based on the user type
        //this helps in thisplaying the "NEW" message on each room when incoming messages
        let handlereceive;
        if (userType === "employer") {
            handlereceive = value.messageemployer;

        } else {
            handlereceive = value.messagejobseeker;
        }
        /**
         * If the loggedUser is equal to the user_id from the database, display the details of the job seekers(value.usertargetid).
         * Else, display the details of the users with the loggedUser == to value.user_id(employer)
         */
        let targetedid;
        if (loggedUser == value.user_id) {
            targetedid = value.usertargetid;
        } else {
            targetedid = value.user_id;
        }
        //iterate over the list of users and find the targetedid that matches the user id from userDetails list
        const user = usersDetails.find((user) => user.user_id == targetedid);
        if (!user) {
            return null;
        }
        {/**  TODO : create the onClick to change the status from new to old // pass value.chatId and "old"*/ }
        return (
            <div key={value.chatId} className="eachGuest" onClick={() => handleAllDivs(value.user_id, value.usertargetid, value.chatId)}>
                <div className="guestImg">
                    {/**display their profile img */}
                    <Image src={imgUrl + user.user_id}
                        style={{ borderRadius: "50%", width: "70px", height: "60px" }}
                        fluid={true}
                        roundedCircle={true}
                        thumbnail={true} />
                </div>
                {/**Display their names */}
                <h5 className="guestName">{`${user.firstName} ${user.lastName}`}</h5>
                {handlereceive !== "old" && <p className="messageNotification" style={{ color: "lightGreen" }}>New</p>}
            </div>
            
        );
    });

    const updateChatStatus = (chatId, messageStatus, usertype) => {
        const dataForm = new FormData();
        dataForm.append("chatid", chatId);
        dataForm.append("messageStatus", messageStatus);
        dataForm.append("usertype", usertype);

        fetch("http://unn-w20039534.newnumyspace.co.uk/myplace/php/updatechatstatus", {
            method: "POST",
            headers: new Headers({ Authorization: "Bearer " + token }),
            body: dataForm,
        })
            .then((response) => response.json())
            .then((json) => {
                if (json.message === "success") {
                    handleUpdate();
                }
            })
            .catch((e) => {
                console.log(e.message);
            });
    }//end

    /**
     * Send a new message to the activeRoom in firebase
     */
    const handleSubmit = async (event) => {
        event.preventDefault();

        if (newMessage === "") { return }; // if there is no message, return null;
        createChat();//create the room in the database

        /** 
         * each time a new message is sent, update the database.
         * if usertype is employer than the room is set to jobseeker has new message 
         * else, it is the other way arround
         */
        if (userType === "employer") {
            updateChatStatus(roomID, "new", "jobseeker");
        } else {
            updateChatStatus(roomID, "new", "employer");
        }
        
        //send the message to firebase
        await addDoc(messagesRef, {
            text: newMessage,
            createdAt: serverTimestamp(),
            user: firstName + " " + lastName,
            room: activeRoom,
            userType: userType
        });
        setNewMessage("");
    }//end

    /**
     * This function creates a room when the employer first sends an email to the job seeker.
     * If the message is not being sent, the room will not be created in the database
     */
    const createChat = () => {
        //if room does not exist in the database and the guestuserid is being fetched from the url
        //create the room in the database
        if (isRoomCreated === false && guestuserid !== "") {
            const dataForm = new FormData();
            dataForm.append("guestuserid", guestuserid);

            fetch("http://unn-w20039534.newnumyspace.co.uk/myplace/php/createchat", {
                method: "POST",
                headers: new Headers({ Authorization: "Bearer " + token }),
                body: dataForm,
            })
                .then((response) => response.json())
                .then((json) => {
                    if (json.message === "success") {
                        setIsRoomCreated(true);//room was created now
                        handleUpdate();
                    }
                })
                .catch((e) => {
                    console.log(e.message);
                });
        }
    };//end



    //date time formatter to format each date of the message
    const formatDate = (timestamp) => {
        if (!timestamp) return "";
        const date = timestamp.toDate();
        return date.toLocaleDateString("en-US", {
            year: "numeric",
            month: "short",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit",
        });
    };

    return (
        <div className="chatApp-container">
            <div className="guestList">
            {isLoading ? (
            <div>Loading...</div>
        ) : (
            listOfRooms
        )}
            </div>

            <div className="chat-app">
                <div className="myMessages">
                    {/* Iterate through the messages of the activeRoom and display them */}
                    {(messages[activeRoom] || []).map((message) => (
                        <div
                            key={message.id} 
                            /**
                             * if the message user is equal to the current loggedUser, 
                             * className of the message is set to loggedUser, else, it is guestUser
                             */
                            className={`message ${message.user === firstName + " " + lastName
                                ? "message-loggedUser"
                                : "message-guestUser"
                                }`}
                        >
                            {/* Display the timestamp of the message */}
                            <div className="timestamp">{formatDate(message.createdAt)}</div>
                            <span className="user">{message.user}:</span> {message.text}
                        </div>
                    ))}
                </div>
                {/* Check if there's an active room, and if so, render the message input form */}
                {activeRoom !== "" && <form className="textBoxMessage" onSubmit={handleSubmit}>
                    <input
                        className="new-message-input"
                        placeholder="Type your message"
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                    />
                    <button type="submit" className="send-button">
                        Send
                    </button>
                </form>}
            </div>
            {activeRoom === "" && <h2 className="noConversation">Chat Messages</h2>}
            {guestuserid !== "" && !isRoomCreated && <h6 className="conversationStart">Write a message to {guestName}</h6>}
        </div>
    );
}
export default ChatApp;