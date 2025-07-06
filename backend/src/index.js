"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const dotenv_1 = __importDefault(require("dotenv"));
const pg_1 = require("pg");
const cors_1 = __importDefault(require("cors"));
dotenv_1.default.config();
const app = (0, express_1.default)();
const port = process.env.PORT || 4000;
// Set up PostgreSQL connection pool
const pool = new pg_1.Pool({
    connectionString: process.env.DATABASE_URL,
});
app.use(express_1.default.json());
app.use((0, cors_1.default)());
app.get('/', (req, res) => {
    res.send('Hello from Node.js backend!');
});
// Test DB connection
app.get('/db-test', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const result = yield pool.query('SELECT NOW()');
        res.json({ time: result.rows[0].now });
    }
    catch (err) {
        if (err instanceof Error) {
            res.status(500).json({ error: err.message });
        }
        else {
            res.status(500).json({ error: String(err) });
        }
    }
}));
// --- USERS ROUTER ---
const usersRouter = express_1.default.Router();
// Get all users
usersRouter.get('/', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const result = yield pool.query('SELECT * FROM users');
        res.json(result.rows);
    }
    catch (err) {
        if (err instanceof Error) {
            res.status(500).json({ error: err.message });
        }
        else {
            res.status(500).json({ error: String(err) });
        }
    }
}));
// Get user by ID
usersRouter.get('/:id', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const id = req.params['id'];
    if (!id) {
        return res.status(400).json({ error: 'ID is required' });
    }
    try {
        const result = yield pool.query('SELECT * FROM users WHERE id = $1', [id]);
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'User not found' });
        }
        res.json(result.rows[0]);
    }
    catch (err) {
        if (err instanceof Error) {
            res.status(500).json({ error: err.message });
        }
        else {
            res.status(500).json({ error: String(err) });
        }
    }
}));
// Create new user
usersRouter.post('/', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { name, email } = req.body;
        const result = yield pool.query('INSERT INTO users (name, email) VALUES ($1, $2) RETURNING *', [name, email]);
        res.status(201).json(result.rows[0]);
    }
    catch (err) {
        if (err instanceof Error) {
            res.status(500).json({ error: err.message });
        }
        else {
            res.status(500).json({ error: String(err) });
        }
    }
}));
// Update user
usersRouter.put('/:id', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const id = req.params['id'];
    if (!id) {
        return res.status(400).json({ error: 'ID is required' });
    }
    try {
        const { name, email } = req.body;
        const result = yield pool.query('UPDATE users SET name = $1, email = $2 WHERE id = $3 RETURNING *', [name, email, id]);
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'User not found' });
        }
        res.json(result.rows[0]);
    }
    catch (err) {
        if (err instanceof Error) {
            res.status(500).json({ error: err.message });
        }
        else {
            res.status(500).json({ error: String(err) });
        }
    }
}));
// Delete user
usersRouter.delete('/:id', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const id = req.params['id'];
    if (!id) {
        return res.status(400).json({ error: 'ID is required' });
    }
    try {
        const result = yield pool.query('DELETE FROM users WHERE id = $1 RETURNING *', [id]);
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'User not found' });
        }
        res.json({ message: 'User deleted' });
    }
    catch (err) {
        if (err instanceof Error) {
            res.status(500).json({ error: err.message });
        }
        else {
            res.status(500).json({ error: String(err) });
        }
    }
}));
// Mount the users router
app.use('/users', usersRouter);
app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
});
