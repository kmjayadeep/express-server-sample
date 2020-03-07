const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const app = express();
app.use(bodyParser.urlencoded({
  extended: false
}));
app.use(bodyParser.json());
app.use(cors());

app.get('/', (req,res)=>{
  res.json('hello world')
})

const streamUrl = 'https://d31pknft723cjz.cloudfront.net/novacast_live/ngrp:nova_test2_all/playlist.m3u8';
let loginMarker = false;
let loginTime = null;
let logoutTime = null;
let device = null;

app.post('/auth/login', (req, res)=>{
  const { username, password } = req.body;
  console.log(username, password);
  if(username !== 'admin'){
    return res.status(401).json({
      message: 'username not found, please contact your local sales office'
    });
  }
  if(password !== 'password'){
    return res.status(401).json({
      message: 'username / password combination not found.  Please contact your local sales office'
    });
  }
  if(loginMarker){
    return res.status(401).json({
      message: 'you are already logged in.  please try again later.  If problem persists, please contact your local sales office'
    });
  }

  loginMarker = true;
  loginTime = Date.now();
  logoutTime = Date.now();
  device = req.headers['user-agent'];

  const token = jwt.sign({
    username,
    createdAt: Date.now(),
    expires: Date.now() + 1000*60*60
  }, 'secretKey');

  console.log(device, token);

  res.json({
    language: 'English',
    token,
    streamUrl,
    username
  });
  
});

app.get('/motd', (req, res)=>{
  res.json({
    data: "Sample message of the day"
  })
});

app.get('/api/logout', (req, res)=>{
 loginMarker = false;
  res.json('success')
});



app.listen(4000, ()=>console.log('listening'));
