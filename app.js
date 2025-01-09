const express = require('express');
const bodyParser = require('body-parser');
const session = require('express-session');
const cors = require('cors');
const dotenv = require('dotenv');


const userRoutes = require('./routes/user.route');
const adminRoutes = require('./routes/admin.route');

const sequelize = require('./config/db'); 
require('./models/employee.model');
require('./models/leave.model');
// require('./models/association');


const port =  process.env.PORT||3000;
dotenv.config();
const app = express();
app.use(express.json());
app.use(bodyParser.json());
app.use(cors({
  origin: "*", 
  methods:['GET','POST','PUT','DELETE'],
  credentials: true,
 allowedHeaders:['Content-Type','Authorization'],
}));



app.use(session({
  secret: process.env.SESSION_SECRET, 
  resave: false,
  saveUninitialized: false,
  cookie: { secure: false } 
}));


app.use('/api/user', userRoutes);
app.use('/api/admin',adminRoutes);


sequelize.sync({alter:false}).then(() => {
  console.log('Database synced successfully');
}).catch((error) => {
  console.error('Error syncing database:', error);
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});


