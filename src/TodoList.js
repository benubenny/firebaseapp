import React, { useState, useEffect } from 'react';
import { getFirestore, collection, addDoc, getDocs, deleteDoc, doc, updateDoc, query, where } from 'firebase/firestore';
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, onAuthStateChanged } from 'firebase/auth';
import app from './firebase.config';

const auth = getAuth(app);
const db = getFirestore(app);

const SecureTodoApp = () => {
    const [user, setUser] = useState(null);
    const [todos, setTodos] = useState([]);
    const [newTodo, setNewTodo] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(true);
    const [editingTodo, setEditingTodo] = useState({ id: null, text: '' }); // Moved inside component

    // Auth state observer
    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (user) => {
            setUser(user);
            setLoading(false);
            if (user) {
                fetchTodos(user.uid);
            } else {
                setTodos([]);
            }
        });

        return () => unsubscribe();
    }, []);

    // Fetch todos for authenticated user
    const fetchTodos = async (userId) => {
        try {
            const q = query(
                collection(db, 'todos'),
                where('userId', '==', userId)
            );
            const querySnapshot = await getDocs(q);
            const todoList = [];
            querySnapshot.forEach((doc) => {
                todoList.push({ id: doc.id, ...doc.data() });
            });
            setTodos(todoList);
        } catch (error) {
            console.error('Error fetching todos:', error);
        }
    };

    const startEditing = (todo) => {
        setEditingTodo({ id: todo.id, text: todo.text });
    };

    const cancelEditing = () => {
        setEditingTodo({ id: null, text: '' });
    };

    const saveEdit = async (id) => {
        if (!editingTodo.text.trim()) return;

        try {
            await updateDoc(doc(db, 'todos', id), {
                text: editingTodo.text
            });
            setEditingTodo({ id: null, text: '' });
            fetchTodos(user.uid);
        } catch (error) {
            console.error('Error updating todo:', error);
        }
    };

    // Sign up function
    const handleSignUp = async (e) => {
        e.preventDefault();
        try {
            setError('');
            await createUserWithEmailAndPassword(auth, email, password);
            setEmail('');
            setPassword('');
        } catch (error) {
            setError('Failed to create account: ' + error.message);
        }
    };

    // Sign in function
    const handleSignIn = async (e) => {
        e.preventDefault();
        try {
            setError('');
            await signInWithEmailAndPassword(auth, email, password);
            setEmail('');
            setPassword('');
        } catch (error) {
            setError('Failed to sign in: ' + error.message);
        }
    };

    // Sign out function
    const handleSignOut = async () => {
        try {
            await signOut(auth);
        } catch (error) {
            setError('Failed to sign out');
        }
    };

    // Add todo function
    const addTodo = async (e) => {
        e.preventDefault();
        if (!newTodo.trim() || !user) return;

        try {
            await addDoc(collection(db, 'todos'), {
                text: newTodo,
                completed: false,
                userId: user.uid,
                timestamp: new Date().toISOString()
            });
            setNewTodo('');
            fetchTodos(user.uid);
        } catch (error) {
            console.error('Error adding todo:', error);
        }
    };

    // Delete todo
    const deleteTodo = async (id) => {
        try {
            await deleteDoc(doc(db, 'todos', id));
            fetchTodos(user.uid);
        } catch (error) {
            setError('Failed to delete todo');
        }
    };

    // Toggle todo completion
    const toggleComplete = async (id, completed) => {
        try {
            await updateDoc(doc(db, 'todos', id), {
                completed: !completed
            });
            fetchTodos(user.uid);
        } catch (error) {
            setError('Failed to update todo');
        }
    };

    if (loading) {
        return <div className="text-center mt-8">Loading...</div>;
    }

    // Authentication form
    if (!user) {
        return (
            <div className="max-w-md mx-auto mt-8 p-6 bg-white rounded-lg shadow-md">
                <h2 className="text-2xl font-bold mb-4">Authentication</h2>
                {error && <p className="text-red-500 mb-4">{error}</p>}
                <form className="space-y-4">
                    <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="Email"
                        className="w-full p-2 border rounded"
                    />
                    <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Password"
                        className="w-full p-2 border rounded"
                    />
                    <div className="space-x-4">
                        <button
                            onClick={handleSignIn}
                            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                        >
                            Sign In
                        </button>
                        <button
                            onClick={handleSignUp}
                            className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
                        >
                            Sign Up
                        </button>
                    </div>
                </form>
            </div>
        );
    }

    // Todo list
    return (
        <div className="max-w-md mx-auto mt-8 p-6 bg-white rounded-lg shadow-md">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold">Todo List</h2>
                <div>
                    <span className="mr-4 text-gray-600">{user.email}</span>
                    <button
                        onClick={handleSignOut}
                        className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
                    >
                        Sign Out
                    </button>
                </div>
            </div>

            <form onSubmit={addTodo} className="mb-4">
                <div className="flex gap-2">
                    <input
                        type="text"
                        value={newTodo}
                        onChange={(e) => setNewTodo(e.target.value)}
                        placeholder="Add a new todo"
                        className="flex-1 p-2 border rounded"
                    />
                    <button
                        type="submit"
                        className="bg-blue-500 text-white px-4 py-2 rounded"
                    >
                        Add
                    </button>
                </div>
            </form>

            <ul className="space-y-2">
                {todos.map((todo) => (
                    <li
                        key={todo.id}
                        className="flex items-center justify-between p-2 border rounded"
                    >
                        {editingTodo.id === todo.id ? (
                            // Edit mode
                            <div className="flex items-center gap-2 flex-1">
                                <input
                                    type="text"
                                    value={editingTodo.text}
                                    onChange={(e) => setEditingTodo({ ...editingTodo, text: e.target.value })}
                                    className="flex-1 p-1 border rounded"
                                />
                                <button
                                    onClick={() => saveEdit(todo.id)}
                                    className="bg-green-500 text-white px-2 py-1 rounded text-sm"
                                >
                                    Save
                                </button>
                                <button
                                    onClick={cancelEditing}
                                    className="bg-gray-500 text-white px-2 py-1 rounded text-sm"
                                >
                                    Cancel
                                </button>
                            </div>
                        ) : (
                            // Display mode
                            <div className="flex items-center justify-between flex-1">
                                <div className="flex items-center gap-2">
                                    <input
                                        type="checkbox"
                                        checked={todo.completed}
                                        onChange={() => toggleComplete(todo.id, todo.completed)}
                                        className="h-4 w-4"
                                    />
                                    <span className={todo.completed ? 'line-through text-gray-500' : ''}>
                                        {todo.text}
                                    </span>
                                </div>
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => startEditing(todo)}
                                        className="text-blue-500 hover:text-blue-700"
                                    >
                                        Edit
                                    </button>
                                    <button
                                        onClick={() => deleteTodo(todo.id)}
                                        className="text-red-500 hover:text-red-700"
                                    >
                                        Delete
                                    </button>
                                </div>
                            </div>
                        )}
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default SecureTodoApp;