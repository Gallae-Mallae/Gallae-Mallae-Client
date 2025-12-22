import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';

export const stompClient = new Client({
    webSocketFactory: () => new SockJS('https://api.gallaemallae.site/ws'), 
    debug: (str) => {
        console.log('STOMP Debug:', str);
    },
    reconnectDelay: 5000,
    heartbeatIncoming: 4000,
    heartbeatOutgoing: 4000,
});

stompClient.onStompError = (frame) => {
    console.error('Broker reported error: ' + frame.headers['message']);
    console.error('Additional details: ' + frame.body);
};