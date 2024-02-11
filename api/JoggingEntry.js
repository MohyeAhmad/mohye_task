
const express = require('express') ;
const mongoose = require('mongoose') ;

const moment = require('moment') ;
const router = express.Router();
const User = require('./../models/user') ;
const JoggingEntry = require('./../models/JoggingEntry') ;
const authenticateToken = require('./../middleware/authMiddleware');



router.post('/', authenticateToken , (req, res) => {
    let { date = '', distance = '', time = '', location = '' , user = req.userId } = req.body;
     let parsedTime , parsedDate  , parsedDistance;
      

try{
parsedTime = parseInt(time);
}
catch(err){
  return res.status(400).json({ code : 400 , message: 'not valid time' });

}

try{
  
  parsedDate =  moment(date, 'DD-MM-YYYY' ).toDate();

}
catch(err){
  return res.status(400).json({ code : 400 , message: 'not valid Date 11'+ err });


}

try{
  parsedDistance = parseInt(distance);

}
catch(err){
  return res.status(400).json({ code : 400 , message: 'not valid distance' });

}

    if (date == '' || distance == '' || time == '' || location == '' ){
      res.status(400).json({code :400 ,message :  'all field are required '})
    }
    else if (! moment(date, 'DD-MM-YYYY', true).isValid()){
      return res.status(400).json({ code : 400 , message: 'not valid date ' });
    }
    else if(isNaN(parsedTime) && parsedTime < 0 ){
      return res.status(400).json({ code : 400 , message: 'not valid time' });

    }
    
    else {
    
  
if ((req.roleName == "Users" || req.roleName == "Manager") && user == ''){

    user = req.userId; 
}

    const joggingEntry = new JoggingEntry({
      user,
      date : parsedDate,
      distance : parsedDistance,
      time : parsedTime,
      location,
    });
  
    joggingEntry
      .save()
      .then(savedEntry => {
        res.json({code :201 , message :'record saved successfully ' ,  data : savedEntry});
      })
      .catch(error => {
        res.status(500).json({ code :500 , message : 'Failed to create jogging entry' });
      });
    }
  });


router.get('/' ,authenticateToken , async (req,res) =>{
    let { page = 1, limit = 10, date = '', distance = '', time  = '' , location ='' , user =req.userId} = req.query;


    const filter = {};
    if (date) filter.distance = { $regex: new RegExp(date, 'i') };
    if (distance) filter.distance = { $regex: new RegExp(distance, 'i') };
    if (location) filter.location = { $regex: new RegExp(location, 'i') };

    if (req.roleName == "Admin" || req.roleName == "Manager" ){
      user = req.user 

    }
    else{
      user = req.userId
    }
    
    // const users = await User.find(filter)
 
if (req.roleName == 'Admin'){

    try {
        const totalCount = await JoggingEntry.countDocuments(filter);
        const skip = (page - 1) * limit;
    
        const joggs = await JoggingEntry.find(filter).sort({ date: -1 })
          .skip(skip)
          .limit(+limit);
    
        return res.json({
          page: +page,
          limit: +limit,
          total: totalCount,
          data: joggs,
        });
      } catch (error) {
        console.error('Error retrieving roles:', error);
        return res.status(500).json({code :500,  message: 'Internal server error' });
      }



}
else if (req.roleName == 'Users' || req.roleName == 'Manager'){
    filter.user = req.userId;

    try {
        const totalCount = await JoggingEntry.countDocuments(filter);
        const skip = (page - 1) * limit;
    
        const joggs = await JoggingEntry.find(filter)
          .skip(skip)
          .limit(+limit);
    
        return res.json({
          page: +page,
          limit: +limit,
          total: totalCount,
          data: joggs,
        });
      } catch (error) {
        console.error('Error retrieving roles:', error);
        return res.status(500).json({ message: 'Internal server error' });
      }


}


})


router.delete('/:id', authenticateToken,  async (req, res) => {

    if (! mongoose.Types.ObjectId.isValid(req.params.id)){
        return res.json({ code : 400 , message :'not valid id ' });

    }
 else {
    if (req.roleName == "Admin"){
    try {
      const joggingEntry = await JoggingEntry.findByIdAndDelete(req.params.id );
      if (!joggingEntry) {
        return res.status(404).json({ error: 'Jogging Entry not found' });
      }

      res.json({code :200 , message : 'record deleted successfully '})
    } catch (error) {
      console.error('Error deleting jogging entry:', error);
      res.status(500).json({ error: 'Internal Server Error'+ error });
    }

}
else if (req.roleName == "Users" || req.roleName == "Manager"  ){

    const joggingEntry = await JoggingEntry.findOne({ id: req._id });
    if(!joggingEntry){
        return res.json({code : 400 , message : 'there is no record with this id '})
    }
    else if (joggingEntry.user !=  req.userId) {
        return res.json({code : 401 , message : 'You are not authorized to delete this record   '})
        
    }
    else {
        await joggingEntry.deleteOne();
        return res.json({code : 200 , message : 'Record Deleted Successfully  '})

    }


}





}
  });


  // update jogging 



  router.put('/:id',  authenticateToken ,  async (req, res) => {
    let { id  = '', date = '' , time = '' ,distance = '' ,  location ='' , user = ''} =  req.body;
    if (! mongoose.Types.ObjectId.isValid(req.params.id)){
        return res.status(400).json({ code : 400 , message :'not valid id ' });
        
    }
    else {
    try {

        if (id == '' || date  == '', distance == '' ||time == '' || location == '' || user == ''  ){
            return res.status(400).json({code : 400 , message : 'all field are required '})
        }


        
        else {




            try {
                // Convert the parameter to a number
                  time = parseInt(time);
                  distance =   parseInt(distance);
                  

              
                console.log(number); // Output: the converted number
              } catch (error) {
                return res.status(400).json({code : 400 , message :'Error converting parameter to number'

                })
                console.error('Error converting parameter to number:', error);
              } 
              if (time < 0 ||  distance  < 0 ) {
                return res.status(400).json({code : 400 , message :'time or distance is not valid number '

                })
              } 
              else {

                try {
                    date = new Date(date);

                }
                catch(err){
                    return res.status(400).json({code :400 , message : 'not valid date '})
                }
                

                const  updatedUser = User.find({id : user}) ;
                if (!updatedUser){
                    res.status(400).json({code :400 , message : 'not valid user for update filed'})
                }

                

              
              
              
       if (req.roleName == "Admin") {
        

        
      
      const joggingEntry = await JoggingEntry.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
        runValidators: true,
      });
      if (!joggingEntry) {
        return res.status(404).json({ code :404 , message : 'Jogging Entry not found' });
      }
      res.json({code : 200 , message : 'data updated' , data : joggingEntry});
    }
    else if (req.roleName == "Users" || req.roleName == "Manager"){

        const joggingEntry = await JoggingEntry.find({id : req.params.id });
        if (!joggingEntry){
            return res.status(404).json({ code :404 , message : 'Jogging Entry not found' });

        }
        else {
             
            const joggingEntry = await JoggingEntry.findOneAndUpdate(
                { _id: req.params.id },
                { distance, time, date , location },
                { new: true }
              );
              joggingEntry.save();


            return res.status(200).json({ code :200 , message : 'record updated'});

            




        }

    }
    }
}



} catch (error) {
      console.error('Error updating jogging entry:', error);
      res.status(500).json({ code :500 , message: 'Internal Server Error' });
    }

    
}
    
  });




router.get('/weeklyReport', async (req, res) => {
  try {
    const result = await JoggingEntry.aggregate([
      {
        $group: {
          _id: { $isoWeek: '$date' },
          entries: { $push: '$$ROOT' },
        },
      },
    ]);

    res.json(result);
  } catch (error) {
    console.error('Failed to fetch data:', error);
    res.status(500).json({code :500,message :'An error occurred'});
  }
});
  



  
module.exports = router;