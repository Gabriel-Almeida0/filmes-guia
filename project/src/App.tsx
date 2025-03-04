import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Home } from './pages/Home';
import { Movies } from './pages/Movies';
import { MovieDetails } from './pages/MovieDetails';
import { TVShows } from './pages/TVShows';
import { TVShowDetails } from './pages/TVShowDetails';
import { Genres } from './pages/Genres';
import { SearchResults } from './pages/SearchResults';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/movies" element={<Movies />} />
        <Route path="/movie/:id" element={<MovieDetails />} />
        <Route path="/tv-shows" element={<TVShows />} />
        <Route path="/tv/:id" element={<TVShowDetails />} />
        <Route path="/genres" element={<Genres />} />
        <Route path="/genres/:id" element={<Genres />} />
        <Route path="/search" element={<SearchResults />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;