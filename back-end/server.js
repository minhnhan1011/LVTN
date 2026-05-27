const expess = require('express');
const mysql = require('mysql2');
const cors = require('cors');

const app = expess();

app.use(cors());
app.use(expess.json());

const db = mysql.createConnection({
    user: 'root',
    host: 'localhost',
    password: '',
    database: 'qlbangiay'
});

db.connect((err) => {
    if (err) {
        console.error('Kết nối thất bại:', err);
        return;
    }
});

app.listen(5000, () => {
    console.log('Server đang chạy trên cổng 5000');
});