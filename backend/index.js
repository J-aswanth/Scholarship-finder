const express = require('express')
const mongoose = require('mongoose')
const jwt = require('jsonwebtoken')
const cors = require('cors')
const Scholarship = require('./models/scholarship')
const User = require('./models/user')
const midwareFunc = require('./middleware/auth')
const bcrypt = require('bcrypt')
const app = express()
app.use(express.json())
app.use(cors({
  origin: '*'
}))

async function main() {
  try {
    await mongoose.connect("mongodb+srv://mjashuvasu:6W_3nNGysVS4LmB@cluster0.2gttho9.mongodb.net/scholarship_finder?retryWrites=true&w=majority", {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    console.log("✅ Connected to MongoDB Atlas");
  } catch (err) {
    console.error("❌ MongoDB connection error:", err);
  }
}

main();  // Don't forget to call the function

main().catch(err => console.log(err))
app.listen(5000, () => {
  console.log('Server Running at http://localhost:5000/')
})

app.get('/', (req, res) => {
    res.send('Welcome to the Scholarship Finder API')
})

app.post('/register/', async (request, response) => {
  const {username, password, email} = request.body
  const hashedPassword = await bcrypt.hash(password, 10)
  const dbUsername = await User.find({ Username: username })
  const dbEmail = await User.find({ Email: email })
  if (dbUsername.length === 0 && dbEmail.length === 0) {
    if (password.length < 6) {
      response.status(400)
      response.send('Password is too short')
    } else {
      const newUser = new User({
        Username: username,
        HashedPassword: hashedPassword,
        Email: email,
        college: "",
        course: "",
        cpi: "",
        region: "",
        name: "",
        profilePicture: "",
      })
      const dbResponse = await User.create(newUser)
      response.status(200)
      response.send(`User created successfully`)
    }
  } else {
    response.status(400)
    if(dbUsername.length !== 0){
      response.send('Username already exists')
    }else if(dbEmail.length !== 0){
      response.send('Email already exists')
    }
  }
})

app.post('/login/', async (req, res) => {
  const {username, password} = req.body
  const dbuser = await User.find({ Username: username })
  console.log(dbuser);
  if (dbuser.length === 0) {
    res.status(400).send('Invalid user')
  } else {
    const checkPw = await bcrypt.compare(password, dbuser[0].HashedPassword)
    if (checkPw) {
      const payload = {
        username: username,
        user_id: dbuser.user_id,
      }
      const jwtoken = jwt.sign(payload, 'MY_SECRET_TOKEN')
      res.send(jwtoken)
    } else {
      res.status(400)
      res.send('Invalid password')
    }
    // res.status(200).send(dbuser[0]);
  }
})

app.get('/scholarships/', async (req, res) => {
    try {
        // Fetch scholarships from the database
        const scholarships = await Scholarship.find()
        let links = []
        scholarships.forEach(scholarship => {
            if (scholarship.Links) {
                links.push(JSON.parse(scholarship.Links.replace(/'/g, '"')))
            }
        })
        res.status(200).json(scholarships)
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch scholarships' })
    }
})

app.get('/scholarship/:id', async (req, res) => {
    try {
        // Fetch scholarships from the database
        const { id } = req.params
        const scholarships = await Scholarship.find({ _id: id })
        res.status(200).json(scholarships)
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch scholarships' })
    }
})

app.get('/user/profile', midwareFunc, async (req, res) => {
    try {
      const user = await User.findOne({ Username: req.user.username })
      if (!user) {
        return res.status(404).json({ error: 'User not found' })
      }
      const userProfile = {
        username: user.Username,
        college: user.college,
        course: user.course,
        cpi: user.cpi,
        region: user.region,
        name: user.name,
        profilePicture: user.profilePicture
      }
      res.status(200).json(userProfile)
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch user profile' })
    }
})

app.post('/user/profile/update', midwareFunc, async (req, res) => {
    try {
        const user = await User.findOne({Username: req.user.username})
        if (!user) {
            return res.status(404).json({ error: 'User not found' })
        }
        user.college = req.body.college || user.college
        user.course = req.body.course || user.course
        user.cpi = req.body.cpi || user.cpi
        user.region = req.body.region || user.region
        user.name = req.body.name || user.name
        user.profilePicture = req.body.profilePicture || user.profilePicture
        const updatedUser = await user.save()
        res.status(201).json(updatedUser)
    } catch (error) {
        res.status(500).json({ error: 'Failed to create scholarship' })
    }
})