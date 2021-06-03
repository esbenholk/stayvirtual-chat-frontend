import "./MusicPlayer.css";

export default function SongPlayer(props) {
  const audioUrl = props.audioUrl;
  return (
    <audio style={{ width: "100%" }} controls={true}>
      <source src={audioUrl} />
    </audio>
  );
}
