import Title from "../components/Title.jsx";
import Background from "../components/Background.jsx";
import character from "../assets/character.svg";
import "../styles/Character.css";


function IndexPage() {
  return (
    <Background src="bg1">
      <Title />
      <img src={character} alt="캐릭터" className="character" />
    </Background>
  );
}

export default IndexPage;
