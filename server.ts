const PORT = 5000

import Micro from './structures/Micro.ts'

const app = new Micro()

// add logger middleware
app.use((request) => {
    console.log(`${request.method} ${request.url}`)
})

app.get('/', (request) => {
    request.respond({ body: 'Home Page'})
})

app.get('/auth', (request) => {
    request.respond({ body: 'Auth Page'})
})

app.post('/users', (request) => {
    request.respond({ body: 'Submit User Data'})
})

app.listen(PORT, () => {
    console.log(`Server is now listening to port ${PORT}`)
})