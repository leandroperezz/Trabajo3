import { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Link, useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import './App.css';

//Página que busca al artista, sus álbumes y los detalles de los álbumes
 function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Principal />} /> 
        <Route path="/artist/:id" element={<Detalleartista />} />
        <Route path="/album/:id/:artistId" element={<DetalleAlbum />} />
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
  const [favoritos, setFavoritos] = useState([]);
  const navigate = useNavigate();

  //Pide token a la API y la guarda
  useEffect(() => {

    const favs = JSON.parse(localStorage.getItem("artistaFavoritos")) || [];
    setFavoritos(favs);

    axios.post("https://accounts.spotify.com/api/token",
      new URLSearchParams({
        grant_type: "client_credentials",
        client_id: CLIENTID,
        client_secret: CLIENTSECRET
      }),
      {
        headers: { "Content-Type": "application/x-www-form-urlencoded" }
      }
    ).then(response =>{ setToken(response.data.access_token);
      axios.defaults.headers.common['Authorization'] = "Bearer " + response.data.access_token;
    }).catch(error => console.error("Error al obtener token:", error));
  }, []);

  //Trabaja y actualiza (No recarga) la página
  const buscar = (e)=>{
    e.preventDefault();
    if (busqueda.trim() === "") return;

    axios.get(`https://api.spotify.com/v1/search?q=${busqueda}&type=artist&limit=10`).then(res => {
        setArtista(res.data.artists.items);
      }).catch(err => console.error("Error al buscar artista:", err));
  };

  const guardaFavorito = (artista) =>{
    let actualizados;
    if(favoritos.find(a=>a.id === artista.id)){
      actualizados=favoritos.filter(a=>a.id !== artista.id)
    }
    else{
      actualizados = [...favoritos, artista];
    }
    setFavoritos(actualizados);
    localStorage.setItem("artistasFavoritos", JSON.stringify(actualizados))
  }

  return(<div className = "App">
    <h1>Buscar Artistas</h1>
    <form onSubmit={buscar}>
      <input value={busqueda} onChange={(e) => setBusqueda(e.target.value)} placeholder="Nombre del artista..." />
      <button type="submit">Buscar</button>
    </form>

    <div className = "listaartista">
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
  const navigate = useNavigate();

  useEffect(() => {
    axios.get(`https://api.spotify.com/v1/artists/${id}`)
      .then(res => setArtista(res.data))
      .catch(err => console.error(err));

    axios.get(`https://api.spotify.com/v1/artists/${id}/albums?include_groups=album&limit=10`)
      .then(res => setAlbums(res.data.items))
      .catch(err => console.error(err));
  }, [id]);

  return (
    <div className="detalle-artista">
      <Link to="/" className="volver">Volver</Link>

      {artista && (
        <>
          <h1>{artista.name}</h1>
          {artista.images[0] && <img src={artista.images[0].url} alt={artista.name} />}
        </>
      )}

  <div className="albumes">
    {albums.map(album => (
      <div key={album.id} className="album" onClick={() => navigate(`/album/${album.id}/${id}`)} style={{ cursor: 'pointer' }}>
        {album.images[0] && <img src={album.images[0].url} alt={album.name} />}
        <h4>{album.name}</h4>
        <p>{album.release_date.slice(0, 4)}</p>
      </div>
    ))}
  </div>
</div>
);
}

//Pagina detalle álbum
function DetalleAlbum() {
  const { id, artistId } = useParams();
  const [album, setAlbum] = useState(null);

  useEffect(() => {
    axios.get(`https://api.spotify.com/v1/albums/${id}`)
      .then(res => setAlbum(res.data))
      .catch(err => console.error("Error al cargar álbum:", err));
  }, [id]);

  return (
    <div className="detalle-album">
      <Link to={`/artist/${artistId}`} className="volver">⬅ Volver al artista</Link>

      {album && (
        <>
          <h1>{album.name}</h1>
          <h2>{album.artists[0]?.name}</h2>
          {album.images[0] && <img src={album.images[0].url} alt={album.name} style={{ width: 300 }} />}
          
          <h3>Lista de temas</h3>
          <ol>
            {album.tracks.items.map(track => (
              <li key={track.id}>{track.name}</li>
            ))}
          </ol>
        </>
      )}
    </div>
  );
}

export default App;