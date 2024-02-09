
const Role = require('./../models/role') ;
const User = require('./../models/user') ;

const express = require('express') ;
const router = express.Router();
const authenticateToken = require('./../middleware/authMiddleware');



router.post('/',(req , res)=>{
    let {name =''}= req.body;
name = name.trim() ;
console.log("signUp is calling . . . ")

if (name == ''){

    return res.json({
        code :401 ,
        message : "name field is required  " })

}
else{

Role.find({name}).then(result =>{
    if (result.length){

        res.json({
            code :401 ,
            message : "There is Role With this Name " })

    }
    else {
        const newRole = new Role({
            name 
        });
        newRole.save().then(result => {
            res.json({
                code :201 , 
                message :"Role saved Successfully",
                data : result
            })
        }).catch(err => {
            res.json({
                code :402 , 
                message :"Fail to save Role there is an error because of : " +err
    
                
            })
    
        })


    }

}).catch(err =>{
    res.json({
    code :401 ,
    message : "Unable to Find Role there is a problem " })
})
    

}


});


router.get('/', authenticateToken, async (req, res) => {

    if (req.roleName == "Admin"){
    let { name, page = 1, limit = 10 } = req.body;
    const filter = {};
  
    if (name) {
      filter.name = { $regex: name, $options: 'i' };
    }
  
    try {
      const totalCount = await Role.countDocuments(filter);
      const skip = (page - 1) * limit;
  
      const roles = await Role.find(filter)
        .skip(skip)
        .limit(+limit);
  
      return res.json({
        page: +page,
        limit: +limit,
        total: totalCount,
        data: roles,
      });
    } catch (error) {
      console.error('Error retrieving roles:', error);
      return res.status(500).json({ message: 'Internal server error' });
    }
  }
  else {


    res.status(401).json({code : 401 , message : 'access denied '})
  }
});




  router.delete('/:id' ,authenticateToken , async (req, res)=>{

     if(!req.roleName == "Admin"){
        res.status(401).json({code : 401 , message : 'access denied '})
     }
     else {
        const user = User.find({role :req.params.id}).then(data =>{
            if(data.length > 0){
                res.json({code : 402 , message : 'Cant Delete This Role because there is Users inside it '})

            }
            else{
             const role = await   Role.findByIdAndDelete(req.params.id);
             if (!role){
                res.json({code :402 , message : 'cant find this role '})
             }
             else {
                res.json({code :200 , message : 'Role Deleted Successfully '})

             }


            }

        }).catch(err=>{
            res.json({code : 500 , message : 'Server Error'})
        })
     }


  } )
module.exports = router;