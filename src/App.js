import SignUp from './signUp'
import UserHome from './UserHome'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'


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
