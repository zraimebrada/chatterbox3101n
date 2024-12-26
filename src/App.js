import React, { useState, useRef } from 'react';
import './App.css';
import {
  getAuth,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  signInWithPopup,
  GoogleAuthProvider,
} from 'firebase/auth';
import {
  getFirestore,
  collection,
  query,
  orderBy,
  limit,
  addDoc,
  serverTimestamp,
  where,
  deleteDoc,
  getDocs,
  updateDoc,
} from 'firebase/firestore';
import { useAuthState } from 'react-firebase-hooks/auth';
import { useCollectionData } from 'react-firebase-hooks/firestore';
import { auth, firestore } from './firebase'; // Import Firebase services

function App() {
  const [user] = useAuthState(auth);

  return (
    <div className="App">
      <header>
        <h1>ChatterBoX🧀</h1>
        {user && <SignOut />}
      </header>
      <main>{user ? <ChatRoom /> : <SignIn />}</main>
    </div>
  );
}

// Sign-In and Sign-Up Component with Google Sign-In
function SignIn() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);

  const auth = getAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (isSignUp) {
        await createUserWithEmailAndPassword(auth, email, password);
      } else {
        await signInWithEmailAndPassword(auth, email, password);
      }
    } catch (error) {
      console.error(error.message);
      alert(error.message);
    }
  };

  const signInWithGoogle = async () => {
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(auth, provider);
    } catch (error) {
      console.error(error.message);
      alert(error.message);
    }
  };

  return (
    <div className="auth-container">
      <h3>{isSignUp ? 'Sign Up' : 'Sign In'}</h3>
      <form onSubmit={handleSubmit}>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Email"
          required
        />
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Password"
          required
        />
        <button type="submit">{isSignUp ? 'Sign Up' : 'Sign In'}</button>
      </form>

      <div className="auth-buttons">
        <button onClick={signInWithGoogle}>Sign In with Google</button>
      </div>

      <button
        className="toggle-auth"
        onClick={() => setIsSignUp(!isSignUp)}
      >
        {isSignUp
          ? 'Already have an account? Sign In'
          : 'Don’t have an account? Sign Up'}
      </button>
    </div>
  );
}

// Sign-Out Button
function SignOut() {
  return (
    auth.currentUser && (
      <button className="sign-out" onClick={() => signOut(auth)}>
        Sign Out
      </button>
    )
  );
}

// ChatRoom Component
function ChatRoom() {
  const dummy = useRef();
  const messagesRef = collection(firestore, 'messages');
  const q = query(messagesRef, orderBy('createdAt'), limit(25));

  const [messages] = useCollectionData(q, { idField: 'id' });
  const [formValue, setFormValue] = useState('');

  const sendMessage = async (e) => {
    e.preventDefault();
    const { uid, photoURL } = auth.currentUser;

    await addDoc(messagesRef, {
      text: formValue,
      createdAt: serverTimestamp(),
      uid,
      photoURL,
    });

    setFormValue('');
    dummy.current.scrollIntoView({ behavior: 'smooth' });
  };

  const deleteMessage = async (message) => {
    if (window.confirm('Are you sure you want to delete this message?')) {
      try {
        const q = query(
          messagesRef,
          where('uid', '==', message.uid),
          where('createdAt', '==', message.createdAt)
        );

        const querySnapshot = await getDocs(q);
        querySnapshot.forEach(async (doc) => {
          await deleteDoc(doc.ref);
        });

        console.log('Message deleted successfully!');
      } catch (error) {
        console.error('Error deleting message:', error);
        alert('Failed to delete message. Please try again.');
      }
    }
  };

  const editMessage = async (message, newText) => {
    if (message.uid !== auth.currentUser.uid) {
      alert('You can only edit your own messages!');
      return;
    }

    try {
      const q = query(
        messagesRef,
        where('uid', '==', message.uid),
        where('createdAt', '==', message.createdAt)
      );

      const querySnapshot = await getDocs(q);
      querySnapshot.forEach(async (doc) => {
        await updateDoc(doc.ref, { text: newText });
      });

      console.log('Message updated successfully!');
    } catch (error) {
      console.error('Error editing message:', error);
      alert('Failed to edit message. Please try again.');
    }
  };

  return (
    <div className="chatroom">
      <div className="messages-container">
        {messages &&
          messages.map((msg) => (
            <ChatMessage
              key={msg.createdAt}
              message={msg}
              deleteMessage={deleteMessage}
              editMessage={editMessage}
            />
          ))}
        <span ref={dummy}></span>
      </div>

      <form className="chat-form" onSubmit={sendMessage}>
        <input
          value={formValue}
          onChange={(e) => setFormValue(e.target.value)}
          placeholder="Say something nice"
        />
        <button type="submit" disabled={!formValue}>
          Send
        </button>
      </form>
    </div>
  );
}

// ChatMessage Component
function ChatMessage({ message, deleteMessage, editMessage }) {
  const { text, uid, photoURL } = message;
  const messageClass = uid === auth.currentUser.uid ? 'sent' : 'received';
  const [isEditing, setIsEditing] = useState(false);
  const [editText, setEditText] = useState(text);
  const [showActions, setShowActions] = useState(false);

  const handleEdit = () => {
    if (isEditing) {
      editMessage(message, editText);
    }
    setIsEditing(!isEditing);
  };

  return (
    <div
      className={`message ${messageClass}`}
      onClick={() => setShowActions(!showActions)} // Toggle showActions on click
    >
      <img
        src={photoURL || 'https://api.adorable.io/avatars/23/abott@adorable.png'}
        alt="User Avatar"
      />
      {isEditing ? (
        <input
          value={editText}
          onChange={(e) => setEditText(e.target.value)}
          className="edit-input"
        />
      ) : (
        <p>{text}</p>
      )}

      {uid === auth.currentUser.uid && showActions && (
        <div>
          <button onClick={handleEdit} className="updatebutton">
            {isEditing ? '💾' : '✏️'}
          </button>
          <button onClick={() => deleteMessage(message)}className="updatebutton">🗑️</button>
        </div>
      )}
    </div>
  );
}

export default App;
