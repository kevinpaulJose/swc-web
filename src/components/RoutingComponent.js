import React from "react";
import { Routes, Route, Link } from "react-router-dom";
import GeneralListComponent from "./GeneralListComponents/GeneralListComponent";

export default function RouterComponent() {
  return (
    <Routes>
      <Route path="/about" element={<About />} />
      <Route path="/users" element={<Users />} />
      <Route path="/" element={<GeneralListComponent />} />
    </Routes>
  );
}

function About() {
  return <h2>About</h2>;
}

function Users() {
  return <h2>Users</h2>;
}
