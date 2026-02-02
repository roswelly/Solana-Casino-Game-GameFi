import { io } from 'socket.io-client';

// "undefined" means the URL will be computed from the `window.location` object
// const URL = 'http://54.226.42.122';
const URL = 'http://localhost:5007';

export const socket = io(URL);