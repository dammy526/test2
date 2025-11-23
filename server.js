require('dotenv').config();
const express = require('express');
const session = require('express-session');
const path = require('path');
const app = express();
const apiRoutes = require('./routes/api');
const fs = require('fs');

app.use(express.json());
app.use(session({ secret: process.env.SESSION_SECRET || 'secret', resave:false, saveUninitialized:false }));

const staticPath = path.join(__dirname, 'public');
app.use(express.static(staticPath));
app.get('/', (req,res) => res.sendFile(path.join(staticPath, 'index.html')));
app.use('/api', apiRoutes);

const dataFolder = path.join(__dirname, 'data', 'guilds');
if (!fs.existsSync(dataFolder)) fs.mkdirSync(dataFolder, { recursive: true });

const port = process.env.PORT || 3000;
app.listen(port, ()=>{
  console.log('後端 API 已啟動：' + 'http://localhost:' + port);
});
