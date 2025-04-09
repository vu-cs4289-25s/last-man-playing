
// import React from "react";
// import { Card, CardContent } from "../components/ui/card";
// import Chat from "../components/ui/chat"; // import your Chat component

// const StorePurchase = ({ points }) => (
//   <div className="flex items-center justify-between w-full p-2 mb-2">
//     <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center border-2 border-gray-300">
//       <span className="text-2xl">+</span>
//     </div>
//     <span className="text-sm font-medium">{points} points</span>
//   </div>
// );

// const PlayerScore = ({ name, score }) => (
//   <div className="flex justify-between items-center p-3 bg-gray-200 mb-1">
//     <span className="font-medium">{name}</span>
//     <span className="font-medium">{score} pts</span>
//   </div>
// );

// export default function Leaderboard() {
//   // Mock data for the leaderboard
//   const players = [
//     { name: "Player 1", score: 750 },
//     { name: "Player 2", score: 650 },
//     { name: "Player 3", score: 500 },
//     { name: "Player 4", score: 450 },
//     { name: "Player 5", score: 400 },
//     { name: "Player 6", score: 350 },
//   ];

//   // Mock store items
//   const storeItems = [{ points: 100 }, { points: 250 }, { points: 400 }];

//   // If your Chat expects these from localStorage:
//   const lobbyId = localStorage.getItem("lobbyId") || "123";
//   const userId = localStorage.getItem("myUserId") || "Guest";

//   return (
//     <div className="flex flex-col items-center justify-start min-h-screen w-full bg-gray-100">
//       {/* Header */}
//       <header className="w-full bg-gray-300 py-4 px-6 flex justify-between items-center">
//         <h1 className="text-2xl font-bold tracking-wide">LAST MAN PLAYING</h1>
//         <div className="flex items-center space-x-4">
//           <span className="text-xl font-bold">Time: 55</span>
//           <img
//             src="/api/placeholder/40/40"
//             alt="Profile"
//             className="w-10 h-10 rounded-full border-2 border-gray-500"
//           />
//         </div>
//       </header>

//       {/* Main Content */}
//       <main className="flex justify-center w-full max-w-5xl mt-8 px-4">
//         <div className="flex w-full gap-8">
//           {/* Store Section (left) */}
//           <div className="w-1/4">
//             <h2 className="text-xl font-bold mb-4">ELIMINATED</h2>
//             <Card className="bg-gray-700 p-4">
//               <h3 className="text-white text-lg font-bold mb-4 text-center">
//                 Store
//               </h3>
//               {storeItems.map((item, index) => (
//                 <StorePurchase key={index} points={item.points} />
//               ))}
//             </Card>
//           </div>

//           {/* Leaderboard Section (middle) */}
//           <div className="w-2/4">
//             <Card>
//               <CardContent>
//                 <h2 className="text-xl font-bold mb-4 text-center">
//                   LEADERBOARD
//                 </h2>
//                 {players.map((player, index) => (
//                   <PlayerScore
//                     key={index}
//                     name={player.name}
//                     score={player.score}
//                   />
//                 ))}
//               </CardContent>
//             </Card>
//           </div>

//           {/* Right Column: Chat */}
//           <div className="w-1/4 h-full">
//             <Chat
//               lobbyId={lobbyId}
//               userId={userId}
//             />
//           </div>
//         </div>
//       </main>
//     </div>
//   );
// }


// frontend/src/pages/Leaderboard.jsx

// frontend/src/pages/Leaderboard.jsx

import React from "react";
import { Card, CardContent } from "../components/ui/card";
import Chat from "../components/ui/chat";

const StorePurchase = ({ points }) => (
  <div className="flex items-center justify-between w-full p-2 mb-2">
    <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center border-2 border-gray-300">
      <span className="text-2xl">+</span>
    </div>
    <span className="text-sm font-medium">{points} points</span>
  </div>
);

const PlayerScore = ({ name, score }) => (
  <div className="flex justify-between items-center p-3 bg-gray-200 mb-1">
    <span className="font-medium">{name}</span>
    <span className="font-medium">{score} pts</span>
  </div>
);

export default function Leaderboard() {
  // Mock data
  const players = [
    { name: "Player 1", score: 750 },
    { name: "Player 2", score: 650 },
    { name: "Player 3", score: 500 },
    { name: "Player 4", score: 450 },
    { name: "Player 5", score: 400 },
    { name: "Player 6", score: 350 },
  ];

  const storeItems = [{ points: 100 }, { points: 250 }, { points: 400 }];

  // If Chat expects them:
  const lobbyId = localStorage.getItem("lobbyId") || "123";
  const userId = localStorage.getItem("myUserId") || "Guest";

  return (
    <div className="bg-gray-100 min-h-screen w-full">
      {/* Header (100% wide) */}
      <header className="w-full bg-gray-300 py-4 px-6 flex justify-between items-center">
        <h1 className="text-2xl font-bold tracking-wide">LAST MAN PLAYING</h1>
        <div className="flex items-center space-x-4">
          <span className="text-xl font-bold">Time: 55</span>
          <img
            src="/api/placeholder/40/40"
            alt="Profile"
            className="w-10 h-10 rounded-full border-2 border-gray-500"
          />
        </div>
      </header>

      {/* A fixed-width container centered horizontally */}
      <main
        className="mx-auto mt-8 px-4"
        style={{ width: "1200px" }} // total fixed width
      >
        <div className="flex gap-4">
          {/* LEFT: Store */}
          <div style={{ width: "250px" }}>
            <h2 className="text-xl font-bold mb-4">ELIMINATED</h2>
            <Card className="bg-gray-700 p-4">
              <h3 className="text-white text-lg font-bold mb-4 text-center">
                Store
              </h3>
              {storeItems.map((item, index) => (
                <StorePurchase key={index} points={item.points} />
              ))}
            </Card>
          </div>

          {/* MIDDLE: Leaderboard */}
          <div style={{ width: "500px" }}>
            <Card>
              <CardContent>
                <h2 className="text-xl font-bold mb-4 text-center">
                  LEADERBOARD
                </h2>
                {players.map((player, index) => (
                  <PlayerScore
                    key={index}
                    name={player.name}
                    score={player.score}
                  />
                ))}
              </CardContent>
            </Card>
          </div>

          {/* RIGHT: Chat */}
          <div style={{ width: "350px" }} className="h-[600px] overflow-hidden">
            {/* If you want chat to fill the container fully, set h-[600px] or something */}
            <Chat lobbyId={lobbyId} userId={userId} />
          </div>
        </div>
      </main>
    </div>
  );
}

