const express = require('express');
const app = express();
const PORT = process.env.PORT || 3001;
const path = require('path');
const mysql = require('mysql2');
const util = require('util');

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

const pool = mysql.createPool({
  host: 'localhost',
  user: 't9yu5g7hvmwpybz31jzt',
  password: 'pscale_pw_utCevM55orPMmAKmGjGcZjcg1Uc8akw3GaNUTlPOrR2',
  database: 'todotest',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

const query = util.promisify(pool.query).bind(pool);

async function createTasksTable() {
  try {
    await query(
      'CREATE TABLE IF NOT EXISTS tasks (id INT AUTO_INCREMENT PRIMARY KEY, name VARCHAR(255), completed BOOLEAN)'
    );
    console.log('Таблиця "tasks" створена');
  } catch (error) {
    console.error('Помилка створення таблиці:', error);
  }
}

createTasksTable();

const getTasks = async (req, res, next) => {
  try {
    const tasks = await query('SELECT * FROM tasks');
    res.json(tasks);
  } catch (error) {
    next(error);
  }
};

const addTask = async (req, res, next) => {
  const { name, completed } = req.body;
  if (!name) {
    return res.status(400).json({ message: 'Поле "name" є обов\'язковим' });
  }

  try {
    const result = await query('INSERT INTO tasks (name, completed) VALUES (?, ?)', [name, completed]);
    res.json({ message: 'Завдання додано до бази даних', id: result.insertId });
  } catch (error) {
    next(error);
  }
};

const updateTask = async (req, res, next) => {
  const taskId = req.params.id;
  const { name, completed } = req.body;
  if (!name) {
    return res.status(400).json({ message: 'Поле "name" є обов\'язковим' });
  }

  try {
    await query('UPDATE tasks SET name = ?, completed = ? WHERE id = ?', [name, completed, taskId]);
    res.json({ message: 'Завдання оновлено' });
  } catch (error) {
    next(error);
  }
};

const deleteTask = async (req, res, next) => {
  const taskId = req.params.id;
  try {
    await query('DELETE FROM tasks WHERE id = ?', taskId);
    res.json({ message: 'Завдання видалено з бази даних' });
  } catch (error) {
    next(error);
  }
};

const getAllTasks = async (req, res, next) => {
  try {
    const tasks = await query('SELECT * FROM tasks');
    res.json(tasks);
  } catch (error) {
    next(error);
  }
};

app.get('/', getTasks);

// RESTful API
app.get('/api/tasks', getAllTasks);
app.post('/api/tasks', addTask);
app.put('/api/tasks/:id', updateTask);
app.delete('/api/tasks/:id', deleteTask);

app.use((error, req, res, next) => {
  console.error('Помилка:', error);
  res.status(500).json({ message: 'Внутрішня помилка сервера' });
});

app.listen(PORT, () => {
  console.log(`Сервер запущено на порту ${PORT}`);
});
