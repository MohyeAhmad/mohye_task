require('./config/db');
const apps = require('express')();
const port = 3030;
const RoleRouter = require('./api/Role');
const UserRouter = require('./api/User');
const JoggingRouter = require('./api/JoggingEntry');



const bodyParser = require('express').json;
apps.use(bodyParser());
apps.use('/user', UserRouter);
apps.use('/role', RoleRouter);
apps.use('/jogging', JoggingRouter);
apps.listen(port, () => {
  console.log('server is running ')
})

