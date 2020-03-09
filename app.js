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

const streamUrl = 'http://qthttp.apple.com.edgesuite.net/1010qwoeiuryfg/sl.m3u8';
const streamUrl2 = 'https://d31pknft723cjz.cloudfront.net/novacast_live/ngrp:nova_test_all/playlist.m3u8';
let loginMarker = false;
let loginTime = null;
let logoutTime = null;
let lastActive = null;
let device = null;
let motd = 'Temporibus repellendus doloribus similique et. Est culpa assumenda qui expedita sunt tempore neque. Ut saepe accusamus rem. Architecto id sequi consequuntur minima. Voluptas omnis in consequatur tempora commodi nisi quia. Omnis sunt dolorum quia. Quis quia aut laboriosam consequatur aut qui. Itaque recusandae doloremque minima';

let languageId = 2;

const auth = (req,res,next)=>{
  const authToken = req.headers['x-auth-token'];
  const decoded = jwt.verify(authToken, 'secretKey');
  if(!loginMarker || decoded.expires < Date.now())
    return res.status(401).json({
      message: 'Not Logged in'
    })
  next();
};

app.post('/api/login', (req, res)=>{
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
  lastActive = Date.now();
  device = req.headers['user-agent'];

  const token = jwt.sign({
    username,
    createdAt: Date.now(),
    expires: Date.now() + 1000*60*60
    // expires: Date.now() + 5000
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

app.get('/api/motd', (req, res)=>{
  console.log(motd)
  res.json({
    motd
  })
});

app.get('/api/logout', (req, res)=>{
 loginMarker = false;
 res.json('success')
});

app.get('/api/keepalive', (req, res)=>{
  lastActive = Date.now();
  res.json('success');
});

app.get('/api/language/:id', (req, res)=>{
  languageId = req.params.id;
  res.json({
    message: 'success'
  })
})

app.get('/api/language', (req, res)=>{
  const data = [{
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

  res.json({
    data
  })

  // res.json({
    // data: [{
      // id: 4,
      // language: 'Malayalam',
      // streamUrl,
      // motd,
    // },...data, ...data, ...data, ...data, ...data, ...data,...data,...data]
  // })
});


setInterval(()=>{
  const diff = Date.now() - lastActive;
  console.log(diff, loginMarker)
  if(diff > 10000 && loginMarker) {
    logoutTime = lastActive;
    loginMarker = false;
  }
}, 5000);


app.listen(4000, ()=>console.log('listening'));
