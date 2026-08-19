import { MusicProvider } from './context/MusicContext';
import LohaHome from './pages/LohaHome';

function App() {
  return (
    <MusicProvider>
      <LohaHome />
    </MusicProvider>
  );
}

export default App;
