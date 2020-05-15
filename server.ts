// SAMPLE SERVER

const PORT = 5000

import { path, readFileStr } from './deps.ts'
import { Micro } from './mod.ts'

const app = new Micro()

// add logger middleware
app.use((request) => {
    console.log(`${request.method} ${request.url}`)
})

app.static('/static', path.join(Deno.cwd(), 'public'))

app.get('/', async (request) => {
    const filePath = path.join(Deno.cwd(), 'public', 'index.html')
    const file = await readFileStr(filePath)
    return request.respond({ body: file })
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