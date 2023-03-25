const { response } = require('express')
const express = require('express')
const morgan = require('morgan')
const app = express()

morgan.token('body', function getBody (req) {
  return JSON.stringify(req.body)
})

app.use(morgan(':method :url :status :res[content-length] - :response-time ms :body'))
app.use(express.json())
let persons = [
    {
      "name": "Arto Hellas",
      "number": "040-123456",
      "id": 1
    },
    {
      "name": "Ada Lovelace",
      "number": "39-44-23532",
      "id": 2
    },
    {
      "name": "Dan Abramov",
      "number": "12-43-234234",
      "id": 3
    },
    {
      "name": "Mary Poppendieck",
      "number": "99 23 43",
      "id": 4
    }
  ]


  app.get('/', (request,response) => {
    response.send('<h1>Insane in the membrane<h1>')
  })

  app.get('/api/persons', (request,response) =>{
    response.json(persons)
  })

  app.get('/info', (request,response) => {
    const fecha = new Date()
    let instrucciones = `<p>Phonebook has info for ${persons.length} people</p>`
    instrucciones = instrucciones.concat(`<p>${fecha}</p>`)
    response.send(instrucciones)
  })

  app.get('/api/persons/:id',(request,response)=>{
    const id = Number(request.params.id)
    person = persons.find(x => x.id === id)
    if (person){
        response.json(person)
    }else{
        response.status(404).send()
    }
  })

  app.delete('/api/persons/:id',(request,response)=>{
    const id = Number(request.params.id)
    let size = persons.length
    persons = persons.filter(x => x.id !== id)
    if (size > persons.length){
        response.status(204).send()
    }else{
        response.status(404).send()
    }
  })

  const generateId = () => {
    return Math.floor(Math.random()*1000000)
  }

  app.post('/api/persons', (request,response)=>{
    const body = request.body;
    const finder = persons.find(x => x.name == body.name)
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
    if (finder){
        return response.status(400).json({
            error: 'name must be unique'
        })
    }
    const person = {
        name: body.name,
        number: body.number,
        id: generateId()
    }
    persons = persons.concat(person)
    response.json(person)
  })

  const PORT = 3001;

  app.listen(PORT,()=>{
    console.log(`Server running on port ${PORT}`)
  })