import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Home } from './pages/Home';
import { SitePage } from './pages/SitePage';
import { ProfilePage } from './pages/ProfilePage';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/:siteId" element={<SitePage />} />
        <Route path="/:siteId/:accountId" element={<ProfilePage />} />
      </Routes>
    </Router>
  );
}

export default App;