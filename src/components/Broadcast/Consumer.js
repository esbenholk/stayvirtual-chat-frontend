import React, { useRef, useState } from "react";
import axios from "axios";

export default function Stream(props) {
  const button = useRef();
  const video = useRef();
  const [showVideo, setShowVideo] = useState(false);
  const [showError, setShowError] = useState(false);

  async function init() {
    const peer = createPeer();
    peer.addTransceiver("video", { direction: "recvonly" });
    peer.addTransceiver("audio", { direction: "recvonly" });
  }

  function createPeer() {
    const peer = new RTCPeerConnection({
      iceServers: [
        {
          urls: "stun:stun.stunprotocol.org",
        },
      ],
    });
    peer.ontrack = handleTrackEvent;
    peer.onnegotiationneeded = () => handleNegotiationNeededEvent(peer);

    return peer;
  }

  async function handleNegotiationNeededEvent(peer) {
    try {
      const offer = await peer.createOffer();
      await peer.setLocalDescription(offer);
      const payload = {
        sdp: peer.localDescription,
      };

      const { data } = await axios.post("/api/consumer", payload);
      const desc = new RTCSessionDescription(data.sdp);
      peer.setRemoteDescription(desc).catch((e) => console.log(e));
      setShowVideo(true);
      setShowError(false);
    } catch (error) {
      setShowError(true);
    }
  }

  function handleTrackEvent(e) {
    video.current.srcObject = e.streams[0];
    console.log("deals with the stream", e);
    props.parentCallback("Hey Popsie, How’s it going?");
  }

  return (
    <div
      className="container-ish"
      style={{
        position: "fixed",
        top: "0",
        bottom: "0",
        right: "0",
        left: "0",
        zIndex: "99999",
        pointerEvents: "auto",
        maxWidth: "200px",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <button ref={button} id="my-button" className="sendButton" onClick={init}>
        View Stream
      </button>
      {showVideo && (
        <video
          ref={video}
          controls
          autoPlay
          id="video"
          // muted
        ></video>
      )}
      {showError && <p>there is no stream right now</p>}
    </div>
  );
}
