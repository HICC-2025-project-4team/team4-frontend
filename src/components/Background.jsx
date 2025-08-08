// 📄 Background.jsx
import "../styles/Background.css";
import bg1 from "../assets/background.svg"; // 정적 import

const Background = ({ children }) => {
  return (
    <div className="background-wrapper">
      <img
        src={bg1}
        alt="Background"
        className="background-image"
      />
      <div className="background-content">{children}</div>
    </div>
  );
};

export default Background;
