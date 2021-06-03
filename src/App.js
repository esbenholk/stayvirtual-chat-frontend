import React, { Suspense, useRef, useState } from "react";

import Chat from "./components/Chat/Chat";
import ContentRedistribution from "./components/content_redistribution";

import "./App.css";

import { BrowserRouter as Router, Route } from "react-router-dom";

import Broadcast from "./components/Broadcast/Broadcast.js";

import io from "socket.io-client";

const ENDPOINT = "https://stayvirtual-chat-backend.herokuapp.com/";

const socket = io(ENDPOINT);

const App = () => {
  const [name, setName] = useState();
  const [loggedIn, setLoggedIn] = useState();
  const [myID, setMyID] = useState();

  const nameRef = useRef();

  function runConnection(nameRef) {
    const name = nameRef;
    setLoggedIn(true);

    socket.emit("join", { name }, (error) => {
      if (error) {
        alert(error);
        setLoggedIn(false);
      }
    });
    socket.on("me", (id) => {
      setMyID(id);
    });
  }

  return (
    <Router>
      <Route path="/" exact>
        {!loggedIn && (
          <>
            <div className="outer-container" style={{ zIndex: "1" }}>
              <div className="circletype-container">
                <p id="circletype">
                  www.stayvirtual.online** softly introduces H r w a i l Archive
                  of Human Expression* ·{" "}
                </p>
              </div>
              <div className="container">
                <input
                  placeholder="Name"
                  className="input"
                  type="text"
                  ref={nameRef}
                />
              </div>

              <button
                onClick={(e) => {
                  setName(nameRef.current.value);
                  runConnection(nameRef.current.value);
                }}
                className={"sendButton"}
                type="submit"
              >
                Sign In
              </button>
            </div>
            <p>
              * a generative encyclopedia of images as expressions. <br></br>
              ** an open source landscape <br></br> + live chat
            </p>
          </>
        )}

        <Suspense fallback={null}>
          <ContentRedistribution
            socket={socket}
            loggedIn={loggedIn}
            name={name}
            myID={myID}
          />
          <Chat socket={socket} loggedIn={loggedIn} name={name} myID={myID} />
        </Suspense>
      </Route>

      <Route path="/broadcast" exact>
        <Broadcast socket={socket} />
      </Route>
    </Router>
  );
};

export default App;
