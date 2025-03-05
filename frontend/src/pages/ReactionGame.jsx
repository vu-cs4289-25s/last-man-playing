import React from "react";
import { Button } from "../components/ui/button";

// const TurnsLeft = ({ turns }) => (
//     <div className="flex items-center justify-between w-full p-2 mb-2">
//        <span style="font-family:lexend zetta;" className="text-4xl font-extrabold">
//         {turns}
//         </span> 
//     </div>
// );

// appears once game starts
function TurnsLeft({ turns }) {
    return (
      <div className="text-xl font-bold">
        {turns}
      </div>
    );
};

// create div container
// three x's - xone xtwo xthree
// const Strikes = ({ strikes }) => (
//     <div className="flex items-center justify-between w-full p-2 mb-2">
//     <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center">
//       <span className="text-2xl">+</span>
//     </div>
//     <span className="text-sm font-medium">{points} points</span>
//   </div>
// );
//const strikes = ({}) => (
    // 0, 1, 2, 3 or out and game ends
    // record how many total seconds in game lasted
//);

function Strikes({ strikes }) {
    return {

    };
};

//?
// hold down mouse on green
// turn green = time mouse clicked - time color changed
//const greenButton = ({}) => (
// button change ui
// hold and green
//);

// let go mouse on red
// turn red = time mouse let go - time color changed
//const redButton = ({}) => (
    // button change ui
    // let go and red
//);

// get data from other players
// compare reaction speeds
// if multiple people out, compare time stayed in game

//# of times button switches color
// random time interval of when to switch color

// take avg of raction spees
// rank based on fastest to slowest time avg

// vars
// 15 seconds to start game (click on button) - if not pressed in 15 secs + strike + reset to 15 secs
// total running time of game per person - starts when player hits start - cuts off at successful end or if players acheives three strikes
// number of times the button changes color - var displayed as text
// avg list - for each color change record reaction time
// var reaction time - start count at color change
// strike - strike if let go during hold, click again but do not count as seperate time, strike if color changes and you have not let go/held, STRIKE IF MOUSE CLICKED DURING LET GO
// number of turns left - display as text - edit numer on change

export default function ReactionGame(){
    const [time, setTime] = useState(15);
    const [turns, setTurns] = useState(10);
    const [strikes, setStrikes] = useState(0);
    const [buttonColor, setButtonColor] = useState("green");
    const [buttonLabel, setButtonLabel] = useState("HOLD");

    const toggleButtonState = () => {
        if (buttonColor === "green") {
          setButtonColor("red")
          setButtonLabel("LET GO")
        } else {
          setButtonColor("green")
          setButtonLabel("HOLD")
        }
      }

      const addStrike = () => {
        if (strikes < 3) {
          setStrikes(strikes + 1)
        }
      }

    return(
    <div className="flex flex-col items-center justify-start min-h-screen w-full bg-gray-100">

      {/* Header */}
      <header className="w-full bg-gray-300 py-4 px-6 flex justify-between items-center">
        <h1 className="text-2xl font-bold tracking-wide">LAST MAN PLAYING</h1>
        <div className="flex items-center space-x-4">
          <img
            src="/api/placeholder/40/40"
            alt="Profile"
            className="w-10 h-10 rounded-full border-2 border-gray-500"
          />
        </div>
      </header>

    </div>

    );
}