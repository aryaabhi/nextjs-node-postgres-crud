import { useEffect, useState } from "react";

const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

type User = {
  id: number;
  name: string;
  email: string;
};

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editName, setEditName] = useState("");
  const [editEmail, setEditEmail] = useState("");

  // Fetch users from backend
  useEffect(() => {
    fetch(`${apiUrl}/users`)
      .then((res) => res.json())
      .then(setUsers);
  }, []);

  // Handle add user
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const res = await fetch(`${apiUrl}/users`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email }),
    });
    const newUser = await res.json();
    setUsers((prev) => [...prev, newUser]);
    setName("");
    setEmail("");
    setLoading(false);
  };

  // Handle delete user
  const handleDelete = async (id: number) => {
    await fetch(`${apiUrl}/users/${id}`, { method: "DELETE" });
    setUsers((prev) => prev.filter((u) => u.id !== id));
  };

  // Handle start editing
  const startEdit = (user: User) => {
    setEditingId(user.id);
    setEditName(user.name);
    setEditEmail(user.email);
  };

  // Handle save edit
  const handleEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (editingId === null) return;
    const res = await fetch(`${apiUrl}/users/${editingId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: editName, email: editEmail }),
    });
    const updatedUser = await res.json();
    setUsers((prev) =>
      prev.map((u) => (u.id === editingId ? updatedUser : u))
    );
    setEditingId(null);
    setEditName("");
    setEditEmail("");
  };

  // Handle cancel edit
  const cancelEdit = () => {
    setEditingId(null);
    setEditName("");
    setEditEmail("");
  };

  return (
    <div className="container">
      <h1>Users</h1>
      <ul className="user-list">
        {users.map((u) =>
          editingId === u.id ? (
            <li key={u.id} className="user-item">
              <form onSubmit={handleEdit} className="edit-form">
                <input
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  required
                />
                <input
                  value={editEmail}
                  onChange={(e) => setEditEmail(e.target.value)}
                  type="email"
                  required
                />
                <button type="submit">Save</button>
                <button type="button" onClick={cancelEdit}>
                  Cancel
                </button>
              </form>
            </li>
          ) : (
            <li key={u.id} className="user-item">
              <span>
                {u.name} ({u.email})
              </span>
              <button onClick={() => startEdit(u)}>Edit</button>
              <button onClick={() => handleDelete(u.id)}>Delete</button>
            </li>
          )
        )}
      </ul>
      <h2>Add User</h2>
      <form onSubmit={handleSubmit} className="add-form">
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Name"
          required
        />
        <input
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Email"
          type="email"
          required
        />
        <button type="submit" disabled={loading}>
          {loading ? "Adding..." : "Add User"}
        </button>
      </form>
      <style jsx>{`
        .container {
          max-width: 600px;
          margin: 2rem auto;
          padding: 2rem;
          background: #fff;
          border-radius: 8px;
          box-shadow: 0 2px 8px rgba(0,0,0,0.07);
        }
        .user-list {
          list-style: none;
          padding: 0;
        }
        .user-item {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 0.5rem;
          padding: 0.5rem 0;
          border-bottom: 1px solid #eee;
        }
        .user-item span {
          flex: 1;
        }
        .user-item button {
          margin-left: 0.5rem;
        }
        .add-form,
        .edit-form {
          display: flex;
          gap: 0.5rem;
          margin-top: 1rem;
        }
        input {
          padding: 0.5rem;
          border: 1px solid #ccc;
          border-radius: 4px;
        }
        button {
          padding: 0.5rem 1rem;
          border: none;
          border-radius: 4px;
          background: #0070f3;
          color: #fff;
          cursor: pointer;
        }
        button[type='button'] {
          background: #aaa;
        }
        button:disabled {
          background: #ccc;
          cursor: not-allowed;
        }
      `}</style>
    </div>
  );
}