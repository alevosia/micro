<p align="center">
    <img src="https://i.imgur.com/MXgpvko.png" />
</p>

# Micro
A lite Deno http server framework

## Usage
```ts
// server.ts

import { Micro } from 'https://raw.githubusercontent.com/alevosia/micro/master/structures/Micro.ts'

const app = new Micro()
const PORT = 5000

app.get('/', async (request) => {
    request.respond({ body: 'Hello World!' })
})

app.listen(PORT, () => {
    console.log(`Server is now listening to port ${PORT}`)
})
```

Start server with read and network access
> deno run --allow-read --allow-net server.ts