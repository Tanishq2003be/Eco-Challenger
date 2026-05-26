import React, { useState } from "react";
import "./App.css";

import Welcome from "./pages/Welcome";
import Dashboard from "./pages/Dashboard";
import SignUp from "./pages/SignUp";
import LogIn from "./pages/LogIn";
import Team from "./pages/Team";
import Navbar from "./pages/Navbar";
import JoinTeam from "./pages/JoinTeam";
import CreateTeam from "./pages/CreateTeam";
import UserProfile from "./pages/UserProfile";

import { Routes, Route } from "react-router-dom";

function App() {
  const [user, setUser] = useState({ loggedIn: false, username: "", id: "" });
  return (
    <div className="App">
      <Navbar setUser={setUser} user={user} />
      <Routes>
        <Route path="/" element={<Welcome user={user} />} />
        <Route path="/welcome" element={<Welcome user={user} />} />
        <Route path="/dashboard" element={<Dashboard setUser={setUser} user={user} />} />
        <Route path="/user-profile/:user_id" element={<UserProfile setUser={setUser} user={user} />} />
        <Route path="/join-team" element={<JoinTeam setUser={setUser} user={user} />} />
        <Route path="/create-team" element={<CreateTeam setUser={setUser} user={user} />} />
        <Route path="/sign-up" element={<SignUp setUser={setUser} user={user} />} />
        <Route path="/log-in" element={<LogIn setUser={setUser} user={user} />} />
        <Route path="/teams/:team_code" element={<Team setUser={setUser} user={user} />} />
      </Routes>
    </div>
  );
}

export default App;
