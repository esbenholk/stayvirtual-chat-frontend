import React from "react";

import onlineIcon from "../../icons/onlineIcon.png";

import "./TextContainer.css";

function TextContainer({ users }) {
  return (
    <div
      className="textContainer container-ish messages"
      style={{
        position: "fixed",
        top: "50%",
        transform: "translateY(-50%)",
        zIndex: "99999",
        pointerEvents: "auto",
        maxWidth: "200px",
        display: "flex",
        flexDirection: "column",
      }}
    >
      {users ? (
        <div>
          <p className="users-headline">Online users</p>

          {users.map((user) => (
            <div key={user.name} className="activeItem">
              <p>{user.name}</p>
              <img alt="Online Icon" src={onlineIcon} />
            </div>
          ))}
        </div>
      ) : null}
    </div>
  );
}

export default TextContainer;

// <div className="userContainer">
// <TextContainer users={users} socket={socket} />
// </div>
