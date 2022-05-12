function send() {
    const input = document.getElementById('messageInput');
    const message = input.value;

    if (!message.length) return;

    input.value = '';

    axios
        .post(`/message/${currentUser.clientId}/${currentUser.privateKey}`, {
            message,
        })
        .then(console.log)
        .catch(console.error);
}

function connectToChat() {
    if (!!window.EventSource) {
        startMessageClient();
    } else {
        console.log("Your browser doesn't support SSE");
    }
}

let currentUser = {
    name: localStorage.getItem('name') || '',
    privateKey: localStorage.getItem('privateKey') || '',
    clientId: localStorage.getItem('clientId') || '',
};

let users = {};
let connected = false;

async function startMessageClient() {
    if (!currentUser.clientId || !currentUser.privateKey || !currentUser.name) {
        const name = document.getElementById('nameInput').value;

        if (!name.length) return;

        const {
            data: { id, pk },
        } = await axios.get(window.location.href + 'message/register');

        currentUser.clientId = id;
        localStorage.setItem('clientId', id);
        currentUser.privateKey = pk;
        localStorage.setItem('privateKey', pk);
        currentUser.name = name;
        localStorage.setItem('name', name);
    }
    const { data: _users } = await axios.get(
        window.location.href + 'message/users'
    );

    for (const user of _users) {
        users[user.id] = user;
    }

    var messageSource = new EventSource(
        `/messages/${currentUser.clientId}/${currentUser.privateKey}/${currentUser.name}`
    );

    messageSource.addEventListener(
        'message',
        function (e) {
            const data = e.data.split(':');

            if (data[0] === 'message') {
                const [_, message, id, time] = data;
                const user =
                    id === currentUser.clientId ? 'You' : users[id].name;
                pushMessageToChat(
                    `<p style="color:#${
                        users[id]?.color ?? '#aa0000'
                    };">${new Date(
                        Number(time)
                    ).toLocaleTimeString()} - ${user}: ${message}</p>`
                );
            }
            if (data[0] === 'join') {
                const [_, color, id, timestamp, name] = data;
                users[id] = { color, joined: timestamp, name };
                pushMessageToChat(
                    `<p style="color:#${color};">${name} joined!</p>`
                );
            }
            if (data[0] === 'leave') {
                const [_, id, timestamp] = data;
                pushMessageToChat(
                    `<p style="color:#${users[id]?.color ?? '#aa0000'};">${
                        users[id].name
                    } left!</p>`
                );
                delete users[id];
            }
        },
        false
    );

    messageSource.addEventListener(
        'open',
        function (e) {
            connected = true;
            document.getElementById('prechat').classList.add('if-false');
            document.getElementById('chatInput').classList.remove('if-false');
        },
        false
    );

    messageSource.addEventListener(
        'error',
        function (e) {
            const id_state = document.getElementById('state');
            if (e.eventPhase == EventSource.CLOSED) source.close();
            if (e.target.readyState == EventSource.CLOSED) {
                id_state.innerHTML = 'Disconnected';
            } else if (e.target.readyState == EventSource.CONNECTING) {
                id_state.innerHTML = 'Connecting...';
            }
        },
        false
    );
}

let chat;

function pushMessageToChat(message) {
    if (!chat) {
        chat = document.getElementById('chat');
    }
    chat.innerHTML = `${message}${chat.innerHTML}`;
}

this.addEventListener('keydown', (event) => {
    if (event.key === 'Enter') {
        if (connected) {
            send();
        } else {
            connectToChat();
        }
    }
});

window.addEventListener('popstate', function (event) {
    axios
        .get(window.location.href + 'message/unregister')
        .then(console.log)
        .catch(console.error);
});

if (currentUser.clientId && currentUser.privateKey && currentUser.name) {
    startMessageClient();
}
