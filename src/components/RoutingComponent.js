import React from "react";
import { Container, Nav, Navbar } from "react-bootstrap";
import { Routes, Route } from "react-router-dom";
import GeneralListComponent from "./GeneralListComponents/GeneralListComponent";
import PricesComponent from "./PricesComponents/PricesComponent";

export default function RouterComponent() {
  let path = window.location.href.includes("prizes");
  return (
    <>
      <Navbar bg="light" variant="light">
        <Container>
          <Navbar.Brand href="/">
            <img
              alt=""
              src={require("../assets/logo.png")}
              width="80"
              height="80"
              className="d-inline-block align-top"
            />{" "}
            {/* SWRC Traders */}
          </Navbar.Brand>
          <Navbar.Toggle aria-controls="basic-navbar-nav" />
          <Navbar.Collapse id="basic-navbar-nav">
            <Nav className="me-auto" style={{}}>
              <Nav.Link href="/" style={{ color: path ? "" : "green" }}>
                Home
              </Nav.Link>
              <Nav.Link href="/prizes" style={{ color: path ? "green" : "" }}>
                Prizes
              </Nav.Link>
            </Nav>
          </Navbar.Collapse>
        </Container>
      </Navbar>
      <Routes>
        <Route path="/prizes" element={<PricesComponent />} />
        <Route path="/users" element={<Users />} />
        <Route path="/" element={<GeneralListComponent />} />
      </Routes>
    </>
  );
}

function Users() {
  return <h2>Users</h2>;
}
