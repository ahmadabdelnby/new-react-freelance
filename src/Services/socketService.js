import { io } from 'socket.io-client';

class SocketService {
    constructor() {
        this.socket = null;
        this.connected = false;
    }

    connect(token) {
        if (this.socket?.connected) {
            return this.socket;
        }

        if (!token) {
            // console.warn('No token provided for socket connection');
            return null;
        }

        const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:3000';

        this.socket = io(SOCKET_URL, {
            auth: {
                token: token
            },
            reconnection: true,
            reconnectionDelay: 1000,
            reconnectionAttempts: 5
        });

        this.socket.on('connect', () => {
            // console.log('Socket connected:', this.socket.id);
            this.connected = true;
        });

        this.socket.on('disconnect', () => {
            // console.log('Socket disconnected');
            this.connected = false;
        });

        this.socket.on('connect_error', (error) => {
            // Only log errors that are not authentication errors
            if (error.message !== 'Authentication error') {
                console.error('Socket connection error:', error);
            }
        });

        return this.socket;
    }

    disconnect() {
        if (this.socket) {
            this.socket.disconnect();
            this.socket = null;
            this.connected = false;
        }
    }

    emit(event, data) {
        if (this.socket && this.connected) {
            // console.log('🚀 Emitting socket event:', event, data);
            this.socket.emit(event, data);
        } else {
            console.error('❌ Cannot emit - Socket not connected:', {
                event,
                hasSocket: !!this.socket,
                connected: this.connected
            });
        }
    }

    on(event, callback) {
        if (this.socket) {
            this.socket.on(event, callback);
        }
    }

    off(event, callback) {
        if (this.socket) {
            this.socket.off(event, callback);
        }
    }

    getSocket() {
        return this.socket;
    }

    isConnected() {
        return this.connected;
    }
}

export default new SocketService();
