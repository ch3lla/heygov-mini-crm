import type { Response } from "express";
import { EventEmitter } from "events";

const serverEvents = new EventEmitter();

const clients = new Map<number, Response[]>;

const addClients = (userId: number, res: Response) => {
    const userClients = clients.get(userId) || [];
    userClients.push(res);
    clients.set(userId, userClients); // checks if the user is logged in on multiple devices and appends the new response to that user
    res.on('close', () => { // listens for the close event
        const active = clients.get(userId) || [];
        clients.set(userId, active.filter(c => c !== res)); // removes the just disconnected client from the client map
    });
}

const sendUpdateToUser = (userId: number, type: 'ADD' | 'UPDATE' | 'DELETE', data: any) => {
    const userClients = clients.get(userId);
    if (!userClients) {
        return;
    }

    const payload = `data: ${JSON.stringify({ type, data})}\n\n`; // SSE works with text based data only
    userClients.forEach(client => client.write(payload)); // sends update to all connected clients
}

export { addClients, sendUpdateToUser };