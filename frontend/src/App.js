import { BrowserRouter,Route,Routes } from 'react-router-dom'
import LoginPage from './components/login'; 
import RegisterPage from './components/register';
import ScholarshipDetailPage from './components/scholar'
import ProfilePage from './components/profile';
import Navbar from './components/navbar';
import HomePage from './components/Home';
import './App.css';

function App() {
  return (
    <div className="App">
      <BrowserRouter>
      <Navbar />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/scholarship/:id" element={<ScholarshipDetailPage />} />
      </Routes>
    </BrowserRouter>
    </div>
  );
}

export default App;
