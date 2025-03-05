require('dotenv').config({path: '../.env' });

const express = require('express');
const cors = require("cors");
const app = express();
const PORT = process.env.PORT || 3000;

const db = require("./models");
const authRoutes = require("./routes/auth");
const userRoutes = require("./routes/user");
const lobbiesRoutes = require("./routes/lobbies");

app.use(cors());
app.use(express.json());
app.use("/auth", authRoutes);
app.use("/user", userRoutes);
app.use("/lobbies", lobbiesRoutes);
app.get("/", (req, res) => {
    res.send("server running");
});

db.sequelize.sync({alter:true}).then(() => {
    app.listen(PORT, () => {
        console.log(`server running port ${PORT}`);
    });
}).catch((err) => {
    console.log("Host:", process.env.SUPABASE_DB_HOST);
    console.log("Port:", process.env.SUPABASE_DB_PORT);
    console.log("Error syncing database", err);
});