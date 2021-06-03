import React from "react";

import ReactEmoji from "react-emoji";

const Message = ({ message: { text, user }, name }) => {
  let isSentByCurrentUser = false;

  let trimmedName;

  if (name) {
    trimmedName = name.trim();
  }

  if (user === trimmedName) {
    isSentByCurrentUser = true;
  }

  return isSentByCurrentUser ? (
    <div className="messageContainer justifyEnd">
      <p className="sentText pr-10">{trimmedName}</p>
      <p className="messageText">{ReactEmoji.emojify(text)}</p>
    </div>
  ) : (
    <div className="messageContainer justifyEnd">
      <p className="sentText pl-10 ">{user}</p>

      <p className="messageText">{ReactEmoji.emojify(text)}</p>
    </div>
  );
};

export default Message;
