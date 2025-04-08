// services/api.ts
import axios from 'axios';

// Crear una instancia de Axios con la configuración base
const api = axios.create({
  baseURL: 'http://192.168.18.113:3000',  // Reemplaza con la URL de tu backend
  timeout: 10000,  // Timeout opcional, en milisegundos
});

export default api;
