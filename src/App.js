import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'

import SignUp from './signUp'
import UserHome from './UserHome'


function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<SignUp />} />
        <Route path="/userhome" element={<UserHome />} />
      </Routes>
    </Router>
  )
}

export default App;


export function getRandomBackendUrl() {
  const urls = [
    "http://localhost:4001",
    "http://localhost:4002"
  ];

  const randomIndex = Math.floor(Math.random() * urls.length)
  return urls[randomIndex]
}

