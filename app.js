const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const logger = require('morgan');
const app = express();
app.use(bodyParser.urlencoded({
  extended: false
}));
app.use(bodyParser.json());
app.use(cors());
app.use(logger('tiny'));

app.get('/', (req,res)=>{
  res.json('hello world')
})

const streamUrl = 'https://d31pknft723cjz.cloudfront.net/novacast_live/ngrp:nova_test2_all/playlist.m3u8';
const streamUrl2 = 'https://d31pknft723cjz.cloudfront.net/novacast_live/ngrp:nova_test_all/playlist.m3u8';
let loginMarker = false;
let loginTime = null;
let logoutTime = null;
let device = null;
let motd = 'Sample message of the day';
let languageId = 2;

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
    languageId,
    token,
    streamUrl,
    username,
    motd
  });
  
});

app.get('/motd', (req, res)=>{
  console.log(motd)
  res.json({
    motd
  })
});

app.get('/api/logout', (req, res)=>{
 loginMarker = false;
  res.json('success')
});

app.get('/api/language/:id', (req, res)=>{
  languageId = req.params.id;
  res.json({
    message: 'success'
  })
})

app.get('/api/language', (req, res)=>{
  res.json({
    data: [{
      id: 1,
      language: 'English',
      streamUrl,
      motd
    },{
      id: 2,
      language: 'Chinese',
      streamUrl : streamUrl2,
      motd: 'vere sample'
    },{
      id: 3,
      language: 'Japanese',
      streamUrl,
      motd
    }]
  })
});


app.listen(4000, ()=>console.log('listening'));
