import React, { useState, useEffect } from "react";

// import VideoChat from "../TextContainer/VideoChat.js";
// <VideoChat
// users={users}
// socket={socket}
// id={props.myID}
// myName={props.name}
// />
import TextContainer from "../TextContainer/TextContainer.js";
import Messages from "../Messages/Messages";
import Input from "../Input/Input";

const Chat = (props) => {
  const socket = props.socket;

  const [name, setName] = useState();
  const [users, setUsers] = useState("");
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);

  useEffect(() => {
    if (props.loggedIn) {
      socket.on("message", (message) => {
        setMessages((messages) => [...messages, message]);
      });

      socket.on("roomData", ({ users, username }) => {
        setUsers(users);
        setName(username);
      });
    }
  }, [props.loggedIn, socket]);

  const sendMessage = (event) => {
    event.preventDefault();

    if (message) {
      socket.emit("sendMessage", message, () => setMessage(""));
    }
  };

  return (
    <div
      style={{
        position: "absolute",
        top: "0",
        bottom: "0",
        right: "0",
        left: "0",
        zIndex: "0",
        pointerEvents: "none",
      }}
    >
      {props.loggedIn && (
        <>
          <div
            className="chatContainer container-ish "
            style={{ pointerEvents: "auto" }}
          >
            <Messages messages={messages} name={name} />
            <Input
              message={message}
              setMessage={setMessage}
              sendMessage={sendMessage}
            />
          </div>

          <TextContainer users={users} />
        </>
      )}
    </div>
  );
};

export default Chat;
