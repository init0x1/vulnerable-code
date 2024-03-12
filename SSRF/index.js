const express = require('express');
const hackerRouter = require('./routes/api/hacker');
const { welcomeMessage } = require('./controllers');
const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get('/', (req, res) => {
    res.redirect('/hacker/create');
});


app.use('/', hackerRouter);



app.set('view engine', 'ejs');

const  PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server serving on port ${PORT} `);
});