import React, { useEffect, useRef, useState } from "react";
import Peer from "simple-peer";

import onlineIcon from "../../icons/onlineIcon.png";

export default function VideoChat({ users, socket, id, myName }) {
  const [me, setMe] = useState("");
  const [stream, setStream] = useState();
  const [receivingCall, setReceivingCall] = useState(false);
  const [caller, setCaller] = useState("");
  const [callerSignal, setCallerSignal] = useState();
  const [callAccepted, setCallAccepted] = useState(false);
  const [callEnded, setCallEnded] = useState(false);
  const [name, setName] = useState("");
  const [isCalling, setIsCalling] = useState(false);
  const myVideo = useRef();
  const userVideo = useRef();
  const connectionRef = useRef();

  useEffect(() => {
    navigator.mediaDevices
      .getUserMedia({ video: true, audio: true })
      .then((stream) => {
        setStream(stream);
        myVideo.current.srcObject = stream;
      });

    socket.on("me", (id) => {
      setMe(id);
    });

    socket.on("callUser", (data) => {
      setReceivingCall(true);
      setCaller(data.from);
      setName(data.name);
      setCallerSignal(data.signal);
    });
  }, [myName, name, socket]);

  const callUser = (id) => {
    const peer = new Peer({
      initiator: true,
      trickle: false,
      stream: stream,
    });
    peer.on("signal", (data) => {
      socket.emit("callUser", {
        userToCall: id,
        signalData: data,
        from: me,
        name: myName,
      });
    });
    peer.on("stream", (stream) => {
      userVideo.current.srcObject = stream;
    });
    socket.on("callAccepted", (signal) => {
      setCallAccepted(true);
      peer.signal(signal);
    });

    connectionRef.current = peer;
  };

  const answerCall = () => {
    setCallAccepted(true);
    setIsCalling(true);
    const peer = new Peer({
      initiator: false,
      trickle: false,
      stream: stream,
    });

    peer.on("signal", (data) => {
      socket.emit("answerCall", { signal: data, to: caller });
    });
    peer.on("stream", (stream) => {
      userVideo.current.srcObject = stream;
    });

    peer.signal(callerSignal);
    connectionRef.current = peer;
  };

  const refuseCall = () => {
    setCallAccepted(false);
    setCallEnded(true);
    setReceivingCall(false);
    setIsCalling(false);
  };

  const leaveCall = () => {
    setCallEnded(true);
    setIsCalling(false);
    connectionRef.current.removeStream(stream);
  };

  ////figure out way of opening peer.connection so that we can call each other again!!!!!
  return (
    <>
      <div className="container-ish" style={{ pointerEvents: "auto" }}>
        {users ? (
          <div>
            <p className="users-headline">Online users</p>
            {users.map((user) =>
              user.name !== myName ? (
                <div key={user.name} className="activeItem">
                  <p>{user.name}</p>
                  <img alt="Online Icon" src={onlineIcon} />

                  <button
                    color="primary"
                    aria-label="call"
                    className="dial-up-button"
                    onClick={() => {
                      callUser(user.id);
                      setIsCalling(true);
                    }}
                  >
                    call user
                  </button>
                </div>
              ) : null
            )}
          </div>
        ) : null}
      </div>

      <div
        className="video-container container-ish"
        style={{ pointerEvents: "auto" }}
      >
        <div className="video">
          {stream && (
            <div>
              <video
                playsInline
                muted
                ref={myVideo}
                autoPlay
                controls
                style={{ width: "300px" }}
                onClick={() => {
                  console.log("video press");
                }}
              />
            </div>
          )}
        </div>
        <div className="video">
          {callAccepted && !callEnded ? (
            <div>
              <video
                playsInline
                ref={userVideo}
                autoPlay
                controls
                style={{ width: "300px", zIndex: "999999999" }}
              />
            </div>
          ) : null}
        </div>
        <div className="call-button">
          {callAccepted && !callEnded ? (
            <button variant="contained" color="secondary" onClick={leaveCall}>
              End Call
            </button>
          ) : null}
        </div>
      </div>

      {receivingCall && !callAccepted ? (
        <div className="caller-alert" style={{ pointerEvents: "auto" }}>
          <p>
            hej {myName}, there is another user who wants to contact you!{" "}
            <br></br>Their name is {name}
          </p>
          <div>
            <button variant="contained" color="primary" onClick={answerCall}>
              answer
            </button>
            <button variant="contained" color="primary" onClick={refuseCall}>
              ignore
            </button>
          </div>
        </div>
      ) : null}
    </>
  );
}
