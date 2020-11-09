document.addEventListener('DOMContentLoaded', () => {

    // Connect to websocket
    var socket = io.connect(location.protocol + '//' + document.domain + ':' + location.port);

    // When connected, configure buttons
    socket.on('connect', () => {

       document.querySelectorAll('#submitmessage').forEach(button => {
            button.onclick = () => {
                const selection = document.querySelector('#message').value;
                document.querySelector('#message').value = "";
                socket.emit('submit vote', {'selection': selection});
            };
        });
    });

    socket.on('announce vote', data => {
        const li = document.createElement('li');
        li.innerHTML = `${data.selection}`;
        document.querySelector('#messages').append(li);
    });
});
