import { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Link, useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import './App.css';

//Página que busca al artista y sus álbumes
function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Principal />} /> 
        <Route path="/artist/:id" element={<Detalleartista />} />
      </Routes>
    </BrowserRouter>
  );
}

//Página principal
function Principal(){
  const CLIENTID = "13c5f32a119e4ff6a413fc02afaa8234";
  const CLIENTSECRET = "76e5e5814baa46e49625989b8f607cf3";
  
  const [token, setToken] = useState("");
  const [busqueda, setBusqueda] = useState("");
  const [artista, setArtista] = useState([]);
  const navegacion = useState();

  //Pide token a la API y la guarda
  useEffect(() => {
    axios.post("https://accounts.spotify.com/api/token",
      new URLSearchParams({
        grant_type: "client_credentials",
        client_id: CLIENTID,
        client_secret: CLIENTSECRET
      }),
      {
        headers: { "Content-Type": "application/x-www-form-urlencoded" }
      }
    ).then(response => {
      setToken(response.data.access_token);
      axios.defaults.headers.common['Authorization'] = "Bearer " + response.data.access_token;
    }).catch(error => console.error("Error al obtener token:", error));
  }, []);

  //Trabaja y actualiza (No recarga) la página
  const buscar = (e) => {
    e.preventDefault();
    if (query.trim() === "") return;

    axios.get(`https://api.spotify.com/v1/search?q=${query}&type=artist&limit=10`)
      .then(res => {
        setArtista(res.data.artista.items);
      }).catch(err => console.error("Error al buscar artista:", err));
  };

  return(<div className="App">
    <h1>Buscar Artistas</h1>
    <form onSubmit={searchArtista}>
      <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Nombre del artista..." />
      <button type="submit">Buscar</button>
    </form>

    <div className="listaartista">
      {artista.map(artista => (
        <div key={artista.id} className="artist-card" onClick={() => navigate(`/artist/${artista.id}`)}>
          <img src={artista.images[0]?.url} alt={artista.name} />
          <p>{artista.name}</p>
        </div>
      ))}
    </div>
  </div>);
}

// Página de detalle del artista
function Detalleartista() {
  const { id } = useParams();
  const [artista, setArtista] = useState(null);
  const [albums, setAlbums] = useState([]);

  useEffect(() => {
    axios.get(`https://api.spotify.com/v1/artists/${id}`)
      .then(res => setArtista(res.data))
      .catch(err => console.error(err));

    axios.get(`https://api.spotify.com/v1/artists/${id}/albums?include_groups=album&limit=10`)
      .then(res => setAlbums(res.data.items))
      .catch(err => console.error(err));
  }, [id]);

  return (
    <div style={{ padding: '2rem' }}>
      <Link to="/" style={{ marginBottom: '1rem', display: 'inline-block' }}>⬅ Volver</Link>

      {artista && (
        <>
          <h1>{artista.name}</h1>
          {artista.images[0] && <img src={artista.images[0].url} alt={artista.name} width="200" />}
        </>
      )}

      <h2>Álbumes</h2>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', marginTop: '1rem' }}>
        {albums.map(album => (
          <div key={album.id} style={{ border: '1px solid #ccc', padding: '1rem', width: '150px', textAlign: 'center' }}>
            {album.images[0] && (
              <img src={album.images[0].url} alt={album.name} style={{ width: '100%', borderRadius: '8px' }} />
            )}
            <h4>{album.name}</h4>
            <p>{album.release_date.slice(0, 4)}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Principal;