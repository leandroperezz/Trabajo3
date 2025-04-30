import { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Link, useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';

//Página que busca al artista y sus álbumes
function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Principal />} /> 
        <Route path="/artist/:id" element={<ArtistDetail />} />
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
        setArtists(res.data.artists.items);
      }).catch(err => console.error("Error al buscar artista:", err));
  };


}

export default App;