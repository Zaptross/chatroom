import express, { Request, Response } from 'express';

type Client = {
    color: string;
    name: string;
    res: Response;
    id: string;
    pk: string;
};
const clients: Record<string, Client> = {};

function pushMessage(res: Response, message: string) {
    res.write(`data: ${message}\n\n`);
}

export function attachMessages(app: ReturnType<typeof express>) {
    app.get('/messages/:id/:pk/:name', function (req: Request, res: Response) {
        if (!req.params.id || !req.params.name) {
            res.status(400).send('Bad Request');
        } else {
            res.writeHead(200, {
                'Content-Type': 'text/event-stream',
                'Cache-Control': 'no-cache',
                Connection: 'keep-alive',
            });

            registerClient(req, res, {
                name: req.params.name,
                id: req.params.id,
                pk: req.params.pk,
            });
        }
    });

    app.get('/message/register', function (_, res: Response) {
        res.status(200).json({
            id: generateId(),
            pk: generatePk(),
        });
    });

    app.get('/message/users', function (_, res: Response) {
        res.status(200).json(getUsersData());
    });

    app.post('/message/:id/:pk', (req: Request, res: Response) => {
        if (
            req.params.id &&
            req.params.pk &&
            clients[req.params.id] &&
            clients[req.params.id].pk === req.params.pk &&
            req.body.message
        ) {
            onMessageReceived({
                message: req.body.message,
                id: req.params.id,
                time: Date.now(),
            });
            res.status(200).send('OK');
        } else {
            if (!req.params.id) {
                res.status(400).send('Bad Request: Missing id');
            } else if (!clients[req.params.id]) {
                res.status(404).send('Not Found: No client with that id');
            } else if (!req.body.message) {
                res.status(400).send('Bad Request: Missing message');
            } else {
                res.status(400).send('Bad Request');
            }
        }
    });

    app.delete('/message/:id/:pk', (req: Request, res: Response) => {
        if (
            req.params.id in clients &&
            clients[req.params.id].pk === req.params.pk &&
            unregisterClient(req.params.id)
        ) {
            res.status(200).send('OK');
        } else {
            res.status(400).send('Bad Request');
        }
    });
}

function onMessageReceived({
    id,
    time,
    message,
}: {
    id: string;
    time: number;
    message: string;
}) {
    pushToAllClients(`message:${message}:${id}:${time}`);
}

function pushToAllClients(message: string) {
    for (const client of Object.keys(clients)) {
        pushMessage(clients[client].res, message);
    }
}

function generateId() {
    return (
        Math.random().toString(36).substring(2, 15) +
        Math.random().toString(36).substring(2, 15)
    );
}

function generatePk() {
    return generateId() + generateId();
}

function generateColour() {
    // Generate a random colour between 3333333 and FFFFFFF
    return Math.floor(Math.random() * 16777215 + 16777215 * 0.2).toString(16);
}

function registerClient(
    req: Request,
    res: Response,
    { name, id, pk }: Omit<Client, 'res' | 'color'>
) {
    clients[id] = { res, id, pk, color: generateColour(), name };

    pushToAllClients(`join:${clients[id].color}:${id}:${Date.now()}:${name}`);

    for (const reason of ['close', 'error', 'end']) {
        req.on(reason, () => {
            unregisterClient(id);
        });
    }
}

function unregisterClient(id: string): boolean {
    if (id in clients) {
        try {
            clients[id].res.end();
        } finally {
            console.log(
                new Date().toLocaleString(),
                `Client ${id} disconnected`
            );
            pushToAllClients(`leave:${id}:${Date.now()}`);
            delete clients[id];
            return true;
        }
    }
    return false;
}

function getUsersData() {
    return Object.keys(clients).map((id) => ({
        id,
        name: clients[id].name,
        color: clients[id].color,
    }));
}
