import React, { useRef, useState } from "react";
import "./App.css";
import firebase from "firebase/app";
import "firebase/firestore";
import "firebase/auth";

import { useAuthState } from "react-firebase-hooks/auth";
import { useCollectionData } from "react-firebase-hooks/firestore";

import { ReactComponent as Send } from "./send.svg";
import { ReactComponent as Thumb } from "./thumb.svg";
import Icon from "./icon";

if (!firebase.apps.length) {
	firebase.initializeApp({
		apiKey: "AIzaSyDBQJpT754ETOwzZ1Z105LIF0hBINxrKbA",
		authDomain: "nvnmsg.firebaseapp.com",
		projectId: "nvnmsg",
		storageBucket: "nvnmsg.appspot.com",
		messagingSenderId: "243070491507",
		appId: "1:243070491507:web:6ab769017030be9b240306",
		measurementId: "G-H6YD9797F1",
	});
} else {
	firebase.app(); // if already initialized, use that one
}

const auth = firebase.auth();
const firestore = firebase.firestore();

///////////////////////////////////
var now = Date.now();
var cutoff = now - 60 * 1000;

function Check() {
	// 	const dummy = useRef();
	// 	const messagesRef = firestore.collection("messages");
	// 	const query = messagesRef.orderBy("createdAt");

	// 	const [Msg] = useCollectionData(
	// 		firestore.collection("messages").orderBy("timestamp").endAt(cutoff),
	// 		{ idField: "id" }
	// 	);
	// 	Msg && Msg.map((msg) => console.log("msg"));

	var yesterday = firebase.firestore.Timestamp.now();
	yesterday.seconds = yesterday.seconds - 60 * 10;

	firestore
		.collection("messages")
		.where("date", "<", yesterday)
		.get()
		.then(function (querySnapshote) {
			querySnapshote.forEach((element) => {
				element.ref.delete();
				console.log("NNNNNNNNNNN");
			});
		});
}

/////////////////////////////////////

// const messagesRef = firestore.collection("messages");
// console.log(messagesRef);

// function Checker() {
// 	var yesterday = firebase.firestore.Timestamp.now();
// 	yesterday.seconds = yesterday.seconds - 10;
// 	console.log("Test");
// 	firestore
// 		.collection("messages")
// 		.where("date", ">", yesterday)
// 		.get()
// 		.then(function (querySnapshote) {
// 			querySnapshote.forEach(function (doc) {
// 				console.log(doc.id, " => ", doc.data());
// 			});
// 		})
// 		.catch(function (error) {
// 			console.log("Error getting documents: ", error);
// 		});

// 	firestore
// 		.collection("messages")
// 		.where("date", "<", yesterday)
// 		.get()
// 		.then(function (querySnapshote) {
// 			querySnapshote.forEach((element) => {
// 				element.ref.delete();
// 			});
// 		});
// 	console.log(querySnapshote);
// }

function SignIn() {
	const signInWithGoogle = () => {
		const provider = new firebase.auth.GoogleAuthProvider();
		auth.signInWithPopup(provider);
	};

	return (
		<div>
			<div className="head">
				Let
				<span className="ds">'</span>s Chat
			</div>
			<button className="signin" onClick={signInWithGoogle}>
				<Icon className="gicon" />
				<div className="google">Sign in with Google</div>
			</button>
		</div>
	);
}

function SignOut() {
	return (
		auth.currentUser && (
			<button className="SignOut" onClick={() => auth.signOut()}>
				SignOut
			</button>
		)
	);
}

function ChatRoom() {
	const dummy = useRef();
	const messagesRef = firestore.collection("messages");
	const query = messagesRef.orderBy("createdAt");

	const [messages] = useCollectionData(query, { idField: "id" });

	const [formValue, setFormValue] = useState("");

	const sendMessage = async (e) => {
		e.preventDefault();
		const { uid, photoURL } = auth.currentUser;

		await messagesRef.add({
			text: formValue || "👍️",
			createdAt: firebase.firestore.FieldValue.serverTimestamp(),
			uid,
			photoURL,
		});

		setFormValue("");
		dummy.current.scrollIntoView({ behavior: "smooth" });
	};
	var B = [];
	messages && messages.map((msg) => B.push(msg));
	B = B.slice(-100);

	return (
		<>
			<main>
				{B &&
					B.map((msg) => <ChatMessage key={msg.id} message={msg} />)}
				<div ref={dummy}></div>
			</main>

			<form onSubmit={sendMessage}>
				<div className="input">
					<input
						value={formValue}
						onChange={(e) => setFormValue(e.target.value)}
					/>
				</div>
				<button className="sendbtn" type="submit">
					{formValue === "" ? (
						<Thumb className="thumb" />
					) : (
						<Send className="send" />
					)}
				</button>
			</form>
		</>
	);
}

function ChatMessage(props) {
	const { text, uid, photoURL } = props.message;
	const messageClass = uid === auth.currentUser.uid ? "sent" : "received";
	return (
		<div className={`message ${messageClass}`}>
			<img
				src={
					photoURL ||
					"https://api.adorable.io/avatars/23/abott@adorable.png"
				}
			/>
			<p>{text}</p>
		</div>
	);
}

function App() {
	const [user] = useAuthState(auth);
	Check();
	return (
		<div className="App">
			<header className="App-header">
				<h1>
					<a className="h1" href="https://github.com/nvn5aharan">
						nVn
					</a>
				</h1>
				<SignOut />
			</header>
			<section>{user ? <ChatRoom /> : <SignIn />}</section>
		</div>
	);
}

export default App;
