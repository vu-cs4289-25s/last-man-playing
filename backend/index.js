const express = require('express');
const app = express();
const PORT = process.env.PORT || 3000;

const authRoutes = require('./routes/auth');

app.use(express.json());
app.use('/auth', authRoutes);

app.get('/', (req, res) => {
    res.send('Server running!');
});

app.listen(PORT, () => {
    console.log(`Server running on port: ${PORT}`);
});


