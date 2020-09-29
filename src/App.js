import React, {useState, useRef} from 'react';
import './App.css';

import firebase from 'firebase/app';
import 'firebase/firestore';
import 'firebase/auth';

import {useAuthState} from 'react-firebase-hooks/auth';
import {useCollectionData} from 'react-firebase-hooks/firestore';

firebase.initializeApp({
  apiKey: "AIzaSyA1P4QAINjsLOR6oCfYc4HuJ2fTYUZetNM",
  authDomain: "justinpbarnett-react-chat.firebaseapp.com",
  databaseURL: "https://justinpbarnett-react-chat.firebaseio.com",
  projectId: "justinpbarnett-react-chat",
  storageBucket: "justinpbarnett-react-chat.appspot.com",
  messagingSenderId: "1077871383602",
  appId: "1:1077871383602:web:2ce9d32083cb0e2196182b",
  measurementId: "G-Q9XEVR35S0"
})

const auth = firebase.auth();
const firestore = firebase.firestore();

function SignIn() {
  const signInWithGoogle = () => {
    const provider = new firebase.auth.GoogleAuthProvider();
    auth.signInWithPopup(provider);
  }

  return(
    <button onClick={signInWithGoogle}>Sign in with Google</button>
  )
}

function SignOut() {
  return auth.currentUser && (
    <button onClick={() => auth.signOut()}>Sign Out</button>
  )
}

function ChatRoom() {
  const messageRef = firestore.collection('messages');
  const query = messageRef.orderBy('createdAt');
  const scrollPos = useRef();

  const [messages] = useCollectionData(query, {idField: 'id'});
  const [formValue, setFormValue] = useState('');

  const sendMessage = async(e) => {
    e.preventDefault();
    const {uid, photoURL} = auth.currentUser;

    await messageRef.add({
      text: formValue,
      createdAt: firebase.firestore.FieldValue.serverTimestamp(),
      uid,
      photoURL
    })

    setFormValue('');
    scrollPos.current.scrollIntoView({behavior: 'smooth'});
  }

  return(
    <>
      <main>
        {messages && messages.map(msg => <ChatMessage key={msg.id} message={msg} />)}
        <div ref={scrollPos}></div>
      </main>
      <form onSubmit={sendMessage}>
        <input value={formValue} onChange={(e) => setFormValue(e.target.value)} />
        <button type="submit">Send</button>
      </form>
    </>
  )
}

function ChatMessage(props) {
  const {text, uid, photoURL} = props.message;

  const messageClass = uid === auth.currentUser.uid ? 'sent' : 'received';

  return(
    <div className={`message ${messageClass}`}>
      <img alt='' src={photoURL} />
      <p>{text}</p>
    </div>
  )
}


function App() {
  const [user] = useAuthState(auth);
  
  return (
    <div className="App">
      <header className="App-header">
        {user ? <SignOut /> : null}
      </header>

      <section>
        {user ? <ChatRoom /> : <SignIn />}
      </section>
    </div>
  );
}

export default App;
