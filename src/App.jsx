import React from 'react';
import { BrowserRouter as Router, Route, Link } from "react-router-dom";

import Index from './Pages/Index/Index';
import LoginPage from './Pages/LoginPage/LoginPage';
import RegisterPage from './Pages/RegisterPage/RegisterPage';
import MyAccountPage from './Pages/MyAccount/MyAccount';
import NewsPage from './Pages/News/News';
import ScoreboardPage from './Pages/Scoreboard/Scoreboard';

import Header from './Parts/Header/Header';
import Footer from './Parts/Footer/Footer';

function App() {
  return (
    <Router>
      <Header></Header>
      <div id="main">
        <Route path="/" exact component={Index} />
        <Route path="/news/" component={NewsPage} />
        <Route path="/scoreboard/" component={ScoreboardPage} />
        <Route path="/login/" component={LoginPage} />
        <Route path="/register/" component={RegisterPage} />
        <Route path="/my-account/" component={MyAccountPage} />
      </div>
      <Footer></Footer>
    </Router>
  );
}

export default App;
