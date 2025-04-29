import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import DJApp from './pages/DJApp';
import PlayerApp from './pages/PlayerApp';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<DJApp />} />
        <Route path="/player" element={<PlayerApp />} />
      </Routes>
    </Router>
  );
}

export default App;
