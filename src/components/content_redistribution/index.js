import React, { Suspense } from "react";
import ContentRedistributionCanvas from "./canvas";

// import SongPlayer from "./MusicPlayer";
// <SongPlayer audioUrl="https://res.cloudinary.com/www-houseofkilling-com/video/upload/v1620900008/sounds/AliveForever_clhtnw.mp3" />

export default class ContentRedistribution extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      imageUrls: [],
      hasNewImage: true,
      previewSource: "",
      hasBroadcast: false,
    };
  }

  componentDidMount() {
    this.loadImages();
    this.setState({ hasNewImage: false });

    this.props.socket.on("message", (data) => {
      if (data.newImage) {
        if (!this.state.imageUrls.includes(data.newImage)) {
          this.setState({
            imageUrls: [...this.state.imageUrls, data.newImage],
          });
        }
      }
      if (data.broadcast) {
        console.log("has broadcast", data);
        this.setState({
          hasBroadcast: true,
        });
      }
    });
  }

  loadImages = async () => {
    try {
      const res = await fetch(
        "https://stayvirtual-chat-backend.herokuapp.com/api/getallimages"
      );
      const data = await res.json();
      this.setState({ imageUrls: data.images });
    } catch (error) {
      console.error("this is the output error", error);
    }
  };

  handleFileInputChange = (e) => {
    const file = e.target.files[0];
    this.previewFile(file);
  };

  previewFile = (file) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onloadend = () => {
      this.setState({ previewSource: reader.result });
    };
  };

  handleSubmitFile = (e) => {
    e.preventDefault();
    if (!this.state.previewSource) return;
    this.uploadImage(this.state.previewSource);
  };

  uploadImage = async (base64EncodedImage) => {
    try {
      const res = await fetch(
        "https://stayvirtual-chat-backend.herokuapp.com/api/upload",
        {
          method: "POST",
          body: JSON.stringify({ data: base64EncodedImage }),
          headers: { "Content-type": "application/json" },
        }
      );
      const data = await res.json();

      this.setState({ hasNewImage: true, previewSource: "" });

      this.props.socket.emit("uploadImage", { data }, (error) => {});
    } catch (error) {
      console.error(error);
    }
  };

  render() {
    return (
      <>
        {this.state.imageUrls.length > 1 ? (
          <Suspense fallback={null}>
            <ContentRedistributionCanvas
              imageUrls={this.state.imageUrls}
              loggedIn={this.props.loggedIn}
              hasBroadcast={this.state.hasBroadcast}
            />
          </Suspense>
        ) : null}

        {this.props.loggedIn && (
          <div
            style={{
              position: "absolute",
              bottom: "0",
              width: "65%",
              left: "0",
              display: "flex",
              flexFlow: "row",
              alignItems: "flex-end",
              zIndex: "99999999999",
            }}
            className="container-ish"
          >
            <div
              style={{
                maxWidth: "300px",
                flexGrow: "1",
                position: "relative",
                borderTop: "2px solid black",
                borderRight: "2px solid black",
              }}
              className="flex-column"
            >
              <p
                style={{
                  position: "absolute",
                  bottom: "105%",
                  margin: "0",
                  left: "0",
                  textAlign: "left",
                }}
              >
                {" "}
                Feed me a jpeg
              </p>
              <form onSubmit={this.handleSubmitFile} className="flex-column">
                <input
                  type="file"
                  name="file"
                  placeholder="Upload an Image"
                  onChange={this.handleFileInputChange}
                  style={{
                    marginTop: "20px",
                    marginBottom: "20px",
                    display: "flex",
                    flexFlow: "row-reverse",
                  }}
                  className="custom-file-input"
                ></input>
                {this.state.previewSource && (
                  <img
                    src={this.state.previewSource}
                    alt={this.state.previewSource}
                    style={{ width: "100%" }}
                  />
                )}
                <button className="sendButton" type="submit">
                  UPLOAD
                </button>
              </form>
            </div>
          </div>
        )}
      </>
    );
  }
}
