require('dotenv').config()
const { response } = require('express')
const cors = require('cors')
const Person = require('./models/phonebook')
const express = require('express')
const morgan = require('morgan')
const app = express()

const ObjectId = require('mongoose').Types.ObjectId;

morgan.token('body', function getBody (req) {
  return JSON.stringify(req.body)
})
app.use(cors())
app.use(morgan(':method :url :status :res[content-length] - :response-time ms :body'))
app.use(express.json())


  app.get('/', (request,response) => {
    response.send('<h1>Main page (nothing interesting here)<h1>')
  })


//Section that gets us the whole phonebook document collection
  app.get('/api/persons', (request,response) =>{
    Person.find({}).then(persons =>{
        response.json(persons)
    })
  })


//Section that gets us general info about the webserver
  app.get('/info', (request,response) => {
    const fecha = new Date()
    let instrucciones = ''
    Person.countDocuments({})
      .then(counted => {
        instrucciones= `<p>Phonebook has info for ${counted} people</p>`
        instrucciones = instrucciones.concat(`<p>${fecha}</p>`)
        response.send(instrucciones)
      })
  })

//Function that checks the id so an incorrect id doesn't crash the whole web server
  function isValidObjectId(id){
    if(ObjectId.isValid(id)){
        if((String)(new ObjectId(id)) === id)
            return true;
        return false;
    }
    return false;
}

//Section that finds certain people
  app.get('/api/persons/:id',(request,response)=>{
    if (isValidObjectId(request.params.id)){
        Person.findById(request.params.id)
        .then(person => {
            person !== null ? response.json(person) : response.status(404).send()
        })
    }else{
        response.status(404).send()
    }
  })


//Section that deletes people
  app.delete('/api/persons/:id',(request,response)=>{
    if (isValidObjectId(request.params.id)){
      Person.deleteOne({ _id : request.params.id})
          .then(
            result => {
              if(result.deletedCount > 0){
                response.status(204).send()
              }else{
                response.status(404).send()
              }
            })
    }else{
        response.status(404).send()
    }
  })


//Section that helps us update phone numbers
  app.put('/api/persons/:id',(request, response) => {
    const body = request.body;
    const personUpdate = {
        name: body.name,
        number: body.number,
        id: body.id,
        _id : body._id,
    }
    if(isValidObjectId(request.params.id)){
      Person.findOneAndUpdate({ _id : request.params.id},personUpdate)
          .then(
              result => {
              if(result !== null){
                  response.json(personUpdate)
              }else{
                  response.status(404).send()
              }
              })
    }else{
      response.status(404).send()
    }
})


//Section that allows us to post numbers
  app.post('/api/persons', (request,response)=>{
    const body = request.body;
    Person.find({name: body.name}).then(results => {
      if (!body.name){
          return response.status(400).json({
              error: 'name missing'
          })
      }
      if (!body.number){
          return response.status(400).json({
              error: 'number missing'
          })
      }
      if (results.length > 0){
          return response.status(400).json({
              error: 'name must be unique'
          })
      }
      const person = Person({
          name: body.name,
          number: body.number,
      })
      person.save().then(savedPerson => {
        response.json(savedPerson)
      })
    })
  })

  const PORT = process.env.PORT

  app.listen(PORT,()=>{
    console.log(`Server running on port ${PORT}`)
  })