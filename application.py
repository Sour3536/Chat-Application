import os
import json 
import requests

from flask import Flask, jsonify, render_template, request, session, redirect, url_for
from flask_socketio import SocketIO, emit, leave_room, join_room, send
from flask_session import Session
from time import localtime, strftime

app = Flask(__name__)
app.config["SECRET_KEY"] = os.getenv("SECRET_KEY")
socketio = SocketIO(app)

app.config["SESSION_PERMANENT"] = False
app.config["SESSION_TYPE"] = "filesystem"
Session(app)

currentUsers=[]

ROOMS=["lounge","news","games","coding"]

@app.route("/")
def index():
    return render_template("login.html",currentUsers=currentUsers)

@app.route("/logging",methods=["POST"])
def logging():
	user=request.form.get("username")
	if user in currentUsers:
		return f"<h1>Already Logged In</h1>"
	currentUsers.append(user)
	session["user"]=user
	return redirect(url_for("user"))
	return render_template('logout.html',currentUsers=currentUsers)

@app.route("/user")
def user():
	if "user" in session:
		return render_template("chat.html",username=session["user"],rooms=ROOMS)
	else:
		return redirect('/index')

@app.route("/logout")
def logout():
	user=session["user"]
	currentUsers.remove(user)
	session.pop('user',None)
	session.clear()
	return redirect(url_for('index'))

@socketio.on('message')
def message(data):
	send({'new': data, 'time_stamp': strftime('%b-%d %I:%M%p',localtime())},room=data['room'])

@socketio.on('join')
def join(data):
	print(data)
	join_room(data['room'])
	# emit("entered",{'msg': data['username'] + " has joined the " + data['room'] + " room."}, room= data['room'],broadcast=True)
	send({'new': data},room= data['room'])

@socketio.on('leave')
def leave(data):
	print(data)
	leave_room(data['room'])
	# send({'msg': data['username'] + " has left the " + data['room'] + " room."}, room= data['room'])
	send({'new': data},room= data['room'])

@socketio.on("add room")
def add_room(data):
    room = data["room"]
    ROOMS.append(room)
    emit('room added', {"room": room}, broadcast=True)
