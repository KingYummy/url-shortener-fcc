const express = require('express')
const cors = require('cors')
const bodyParser = require('body-parser')
const app = express()
const mongoose = require('mongoose')
const shortUrl = require('./models/shortUrl')
//Port the appl will listen to
const port = process.env.PORT || 3000

app.use(bodyParser.json())
app.use(cors())

//To connect to the database
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost/shortUrls')

//Allows Node find the static content(public folder)
app.use(express.static(__dirname + '/public'))

app.get('/new/:urlToShorten(*)', (req, res, next) => {
  var {urlToShorten} = req.params
  //RegEx for url
  var regex = /[-a-zA-Z0-9@:%_\+.~#?&//=]{2,256}\.[a-z]{2,4}\b(\/[-a-zA-Z0-9@:%_\+.~#?&//=]*)?/gi

  if (regex.test(urlToShorten)=== true){
    var short = Math.floor(Math.random()* 100000).toString()

    var data = new shortUrl(
      {
        originalUrl: urlToShorten,
        shorterUrl: short
      }
    )
    data.save(err =>{
      if (err){
        return res.send('Error saving to database')
      }
    })
    return res.json(data)
  }
  var data = new shortUrl ({
    originalUrl: urlToShorten,
    shorterUrl: 'invalid url'
  })
  return res.json(data)
})

//Query Database and forward to origiinal url

app.get('/:urlToForward', (req,res,next) =>{
  var shorterUrl = req.params.urlToForward

  shortUrl.findOne({'shorterUrl': shorterUrl}, (err, data) =>{
    if (err) return res.send('Error Reading Database')
    var re = new RegExp("^(http|https)://", "i")
    var strToCheck = data.originalUrl
    if (re.test(strToCheck)){
      res.redirect(301, data.originalUrl)
    }
    else{
      res.redirect(301, 'http://' + data.originalUrl)
    }
  })
})






//Listen to see if everything is working
app.listen(port, () => {
  console.log("Listening on port " + port)
})
