"use client";
import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";

const symbols = ["🧠", "💉", "🔪", "🪓", "👁️", "💀"];
const payouts = {
  "🧠": 10,
  "💉": 20,
  "🔪": 50,
  "🪓": 100,
  "👁️": 500,
  "💀": 1000,
};

const getRandomSymbol = () => symbols[Math.floor(Math.random() * symbols.length)];

const spinReels = () => Array.from({ length: 3 }, () => getRandomSymbol());

const calculatePayout = (reels) => {
  const [a, b, c] = reels;
  if (a === b && b === c) return payouts[a] * 10;
  if (a === b || b === c || a === c) return payouts[a] || payouts[b] || payouts[c];
  return 0;
};

export default function SlotMachine() {
  const [balance, setBalance] = useState(100000);
  const [reels, setReels] = useState(["❓", "❓", "❓"]);
  const [lastWin, setLastWin] = useState(0);
  const [bet, setBet] = useState(100);
  const [highScore, setHighScore] = useState(100000);
  const [spinning, setSpinning] = useState(false);
  const [audio] = useState(() => new Audio("/spin.mp3"));

  useEffect(() => {
    const storedBalance = localStorage.getItem("balance");
    const storedHighScore = localStorage.getItem("highScore");
    if (storedBalance) setBalance(parseInt(storedBalance));
    if (storedHighScore) setHighScore(parseInt(storedHighScore));
  }, []);

  useEffect(() => {
    localStorage.setItem("balance", balance.toString());
    if (balance > highScore) {
      setHighScore(balance);
      localStorage.setItem("highScore", balance.toString());
    }
  }, [balance]);

  const handleSpin = async () => {
    if (balance < bet || spinning) return;
    setSpinning(true);
    audio.play();
    const result = spinReels();
    await new Promise((res) => setTimeout(res, 1200));
    const payout = calculatePayout(result);
    setReels(result);
    setBalance(balance - bet + payout);
    setLastWin(payout);
    setSpinning(false);
  };

  const handleBonusBuy = async (amount) => {
    if (balance < amount) return alert("Insufficient balance");
    setSpinning(true);
    const bonusPayout = Math.floor(Math.random() * amount * 20);
    await new Promise((res) => setTimeout(res, 1200));
    setBalance(balance - amount + bonusPayout);
    setReels(["💀", "💀", "💀"]);
    setLastWin(bonusPayout);
    setSpinning(false);
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-10 bg-black text-white space-y-6">
      <h1 className="text-4xl font-bold">Mental 2 Inspired Slot</h1>
      <div className="text-xl">Balance: ${balance.toLocaleString()} | High Score: ${highScore.toLocaleString()}</div>
      <div className="flex space-x-4 text-6xl">
        {reels.map((s, i) => (
          <motion.span key={i} animate={{ y: [0, -20, 0] }} transition={{ duration: 0.3 }}>
            {s}
          </motion.span>
        ))}
      </div>
      <div className="text-lg">Last Win: ${lastWin.toLocaleString()}</div>
      <div>
        <input
          type="number"
          value={bet}
          onChange={(e) => setBet(parseInt(e.target.value) || 0)}
          min={1}
          max={100000}
          className="text-black px-2 py-1 rounded"
        />
      </div>
      <button onClick={handleSpin} disabled={spinning} className="bg-green-600 px-6 py-2 rounded mt-2 hover:bg-green-700 disabled:opacity-50">
        Spin
      </button>
      <h2 className="text-2xl font-semibold mt-6">Bonus Buy</h2>
      <div className="grid grid-cols-3 gap-2">
        {[100, 1000, 5000, 10000, 50000, 100000].map((amount) => (
          <button key={amount} onClick={() => handleBonusBuy(amount)} className="bg-yellow-600 px-4 py-2 rounded hover:bg-yellow-700">
            Buy ${amount.toLocaleString()}
          </button>
        ))}
      </div>
    </div>
  );
}