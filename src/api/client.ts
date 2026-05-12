import axios from 'axios';

const client = axios.create({
    baseURL: import.meta.env.VITE_API_URL ?? 'https://localhost:64868',
});

export default client;
