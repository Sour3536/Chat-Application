document.addEventListener('DOMContentLoaded',() => {
	// Connect to websocket
    var socket = io.connect(location.protocol + '//' + document.domain + ':' + location.port);

    let room;

    // listening the response from server
    socket.on('message',data =>{
    	console.log(data);
    	const p=document.createElement('p');
    	const span_username=document.createElement('span');
    	const span_timestamp=document.createElement('span');
    	const br=document.createElement('br');
        if(data.time_stamp){
            span_username.innerHTML = data.new.username;
            span_timestamp.innerHTML = data.time_stamp;
            p.innerHTML = span_username.outerHTML + br.outerHTML + data.new.msg + br.outerHTML + span_timestamp.outerHTML;
            document.querySelector('#display-message-section').append(p);        
        }
        else{
            printSysMsg(data.new.msg);
        }
    });

    // Response to add room
    socket.on('room added',data => {
        const p=document.createElement('p');
        p.innerHTML = data.room;
        p.classList.add("select-room");
        document.querySelector('.left').append(p);
        location.reload(true);
    });

    // When Send Button IS Clicked
    document.querySelector('#send_message').onclick = () =>{
    	socket.send({'msg':document.querySelector('#user_message').value,'username': username,'room': room});
        document.querySelector('#user_message').value='';
    }

    // When add room is clicked
    document.querySelector('#add_room').onclick = () =>{
        socket.emit('add room',{'room':document.querySelector('#room_name').value})
    }

    // When Any Room is Clicked
    document.querySelectorAll('.select-room').forEach(p => {
    	p.onclick = () => {
    		let newRoom = p.innerHTML;
    		if(newRoom==room){
    			msg = `You are already in ${room} room.`
    			printSysMsg(msg);
    		}
    		else{
    			leaveRoom(room);
    			joinRoom(newRoom);
    			room = newRoom;
    		}
    	}
    });

    function leaveRoom(room){
    	if(!room){
    		room="News";
    	}
    	socket.emit('leave',{'username': username,'room': room,'msg': username+" has left the "+room+" room."});
    }

    function joinRoom(room){
    	socket.emit('join',{'username': username,'room': room,'msg': username+" has joined the "+room+" room."});	

    	document.querySelector('#display-message-section').innerHTML = '';
    }

    function printSysMsg(msg){
    	const p = document.createElement('p');
    	p.innerHTML = msg;
    	document.querySelector('#display-message-section').append(p);
    }
});