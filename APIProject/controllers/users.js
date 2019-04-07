const User = require('../models/user');
const Car = require('../models/car')

module.exports = {
    /* interact with mongoose in : callback
    index: (req, res, next) => {
        User.find({}, (err, users)=> {
            if (err){
                next(err);
            }
            res.status(200).json(users)

        })

    },*/


    /* interact with mongoose in : Promises
    index: (req, res, next) => {
        User.find({})
        .then(user => {
            res.status(200).json(users)

        })
        .catch(err => {
            next(err);
        });
    },*/


    /* interact with mongoose in : async/await*/
    index: async(req, res, next) => {
        try{
            const users = await User.find({});
            res.status(200).json(users);
        } catch(err){
            next(err);
        }
    },

    /* interact with mongoose in : callback
    newUser: (req, res, next) => {
        const newUser = new User(req.body);
        newUser.save((err, user) => {
            res.status(201).json(user)
        });
    },
    */


    /* interact with mongoose in : Promises*/
    newUser: (req, res, next) =>{
        const newUser = new User(req.body);
        newUser.save()
        .then(user => {
            res.status(201).json(user)

        }).catch(err => {
            next(err)
        })

    }



    /* interact with mongoose in : async/await*/
    newUser: async(req, res, next) => {
        try{
            const newUser = new User(req.body);
            const user = await newUser.save()
            res.status(201).json(user)

        } catch(err){
            next(err);
        }
    },

    getUser: async(req, res, next) => {
        // NEW WAY
        const { userId } = req.value.params; 
        // OLD WAY
        const { userId }= req.params ;
        const user = await User.findById(userId);
        res.status(200).json(user)


    },

    replaceUser: async(req, res, next) => {
        // enforce that req.body must contain all the fields
        const { userId} = req.params;
        const newUser = req.body;
        const result = await User.findByIdAndUpdate(userId, newUser)
        res.status(200).json(result);
    },

    updateUser: async(req, res, next) => {
        // req.body may contain any number of fields
        const { userId} = req.params;
        const newUser = req.body;
        const result = await User.findByIdAndUpdate(userId, newUser)
        res.status(200).json(result);
    },

    getUserCars: async (req, res, next) => {
        const { userId } = req.params;
        const user = await User.findById(userId).populate('cars');
        res.status(200).json(user.cars)
    },

    newUserCar: async(req, res, next) => {
        const { userId } = req.params;
        // Create a new car
        const newCar = new Car(req.body);
        // Get user
        const user = await User.findById(userId)
        // Assign user as a car's seller
        newCar.seller = user;
        //save the car
        await newCar.save()

        //Add car to the user
        user.cars.push(newCar);
        // Save the user
        await user.save();
        res.status(201).json(newCar)

        

    }
}