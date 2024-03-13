const mongoose = require('mongoose');
const User = require('./models/user'); // replace with the path to your User model

const dbUrl = process.env.DB_URL;
mongoose.connect(dbUrl, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => {
        console.log("Mongo Connection Open")
    })
    .catch(err => {
        console.log("Mongo Connection Error")
        console.log(err)
    })

async function seedDB() {
    // Delete all existing users
    await User.deleteMany({});

    // Create 10 new users
    for (let i = 0; i < 10; i++) {
        const user = new User({
            username: `user${i}`,
            password: `password${i}`
        });
        await user.save();
    }

    console.log("DB seeded");
}

seedDB().then(() => {
    mongoose.connection.close();
});