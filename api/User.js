const express = require('express') ;
const router = express.Router();
const User = require('./../models/user') ;
const Role = require('./../models/role') ;
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const transporter = require('./../config/mail');
const generateRandomPassword = require('./methods/Random');
const { json } = require('express');
const fs = require('fs');
const authenticateToken = require('./../middleware/authMiddleware');




router.post('/signIn',(req , res)=>{

console.log('signIn api used')


let { email ='', password = '' } = req.body;
email = email.trim() ;
password = password.trim() ;
if (email == '' || password == ''){
    res.json({
        code :402 ,
        message : "email and password are required to signin . " 
         
    })

}

else {

    User.findOne({ email }).populate('role')
    .then(user => {
      if (!user) {
        // User not found status(404).
        return res.json({ code :404 , message: 'User not found' });
      }

      // Compare the provided password with the stored password
      bcrypt.compare(password, user.password)
        .then(isMatch => {
          if (isMatch) {
            // Passwords match, create and return a JWT
            const token = jwt.sign({ userId: user._id ,  role : user.role._id , roleName :user.role.name  }, 'your-secret-key', { expiresIn: '3h' });
            return res.json({code :200 , message :"login Successfully" ,   role:  user.role.name, token });
          } else {
            // Passwords do not match
            return res.json({ code :402 , message: 'Invalid password' });
          }
        })
        .catch(error => {
          console.error('Error comparing passwords:', error);
          return res.json({code : 500 ,  message: 'Internal server error' +error });
        });
    })
    .catch(error => {
      console.error('Error finding user:', error);
      return res.json({ code : 500 , message: 'Internal server error'  + error});
    });

}


});


router.get('/', authenticateToken , (req , res)=>{
  if(req.roleName == "Admin"){
    let {name ,email } = req.body;
    const filter = {};

    if (name) {
  
      
      filter.name = { $regex: name, $options: 'i' };
    }

    if (email) {
  
        
        filter.email = { $regex: email, $options: 'i' };
      }


    User.find(filter)
    .then(roles => {
      return res.json(roles);
    })
    .catch(error => {
      console.error('Error retrieving roles:', error);
      return res.status(500).json({ message: 'Internal server error' });
    });
  }
  else{
    res.status(401).json({code :401 , message : 'access denied'})
  }


});


router.post('/signUp',(req , res)=>{
let {name  = '', email = '', dateOfBirth = '' , password = ''} = req.body;
name = name.trim() ;
email = email.trim() ;
dateOfBirth = dateOfBirth.trim();
 password = password.trim() ;
let userRole ;


const parsedDate = new Date(dateOfBirth);
if (req.roleName == 'Admin' && req.role   != '' ){
  

  Role.findOne({_id : req.role }).then (fRole => {
    userRole = fRole._id;
    
  
   }).catch(err => {
    res.json( {code  : 500 , 
      message : "can't find Users Role " + err})
   })

}
else{
 const uRole =   Role.findOne({name :'Users'}).then (fRole => {
  userRole = fRole._id;
  

 }).catch(err => {
  res.json( {code  : 500 , 
    message : "can't find Users Role " + err})
 })
}
if (name == "" ||email == "" || dateOfBirth == "" || password == "" ){
    return res.json({ code : 402 , message: 'all Field are required' });
}

else if (! /^[a-zA-Z ]*$/.test(name)){
    return res.json({ code : 402 , message: 'not valid name  , must be alphabetic ' });
}

else if (!/^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/.test(email)){
    return res.json({ code : 402 , message: 'not valid email' });
}
else if (isNaN(parsedDate.getTime())){
    return res.json({ code : 402 , message: 'not valid date Of Birth' });
}
else if (password.length < 8){
    return res.json({ code : 402 , message: 'Password Must be at least 8 character or numbers  ' });
}
else{
    User.find({email}).then(result =>{
        if (result.length){
            res.json({code: 402 , message : "there is another user with this email try to reset "}) 
        }
        else {
            password = bcrypt.hash(password , 10  ).then( hashedpass=>{

              const newUser  = new  User(
                {name , email , password : hashedpass ,  dateOfBirth ,role : userRole}
  
              );
              newUser.save().then(result =>{


                res.json({
                  status : 201 ,
                  message : "user Created" ,
                  data : result
                })
              }).catch(err => {
                res.json({
                  status : 500 , 
                  message : "Faild on save User " + err
                })
              })


            })
        
          
        }
      
    }).catch(err=>{
        console.log("unable to fitch Users ");
        res.json({code: 500 , message : "unable to fitch Users "})

    })
}
});

router.post('/restPass' , (req , res) => {


  let {email = ''} = req.body;
  if (email ==  ''){
   return  res.json({
      code : 402 , 
      message : 'email field is required '
    })
  }
  else if (!/^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/.test(email)){
    return res.json({
      code : 402 , 
      message : 'email format is not correct please enter valid email '
    })
  }
  else{

  User.findOne({ email })
    .then(user => {
      if (!user) {
        // User not found status(404).
        return res.json({ code :402 , message: 'this email not registered' });
      }
      
     else{


      let newPass = generateRandomPassword(10);
           user.password = bcrypt.hash(newPass , 10  ).then( hashedpass=>{

            user.password = hashedpass ;

           

            user.save().then(data =>{

              const emailTemplate = fs.readFileSync('restMailTemplate.html', 'utf-8');
              const htmlContent = emailTemplate.replace('{{ newPass }}', newPass);

              const mailOptions = {
                from:  'mohyeahmad98@gmail.com',
                to: user.email,
                subject: 'New Password for Your Account ',
                html: htmlContent
              };
              transporter.sendMail(mailOptions, (error, info) => {
                if (error) {
                  res.json({
                    code : 500 , 
                    message : 'failed to send mail '
                  })
                  console.error('Error sending email:', error);
                } else {
                  res.json({
                    code : 200 , 
                    message : 'new password sended'
                  })
                  console.log('Email sent:', info.response);
                }
              });

            })
           }).catch(err =>{
            res>json({
              code :500 ,
              message : "error on hashing password "
            })

           })
    


     }
    
    }).catch(err => {
      res.json({
        code : 500 , 
        message : 'error on finding user'
      })
    })
  }


})


module.exports = router;


