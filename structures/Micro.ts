import { serve, Server, ServerRequest } from '../deps.ts'

type RequestHandler = (request: ServerRequest) => any
type ListenCallback = (error?: any) => void

export enum HTTPMethod {
    GET = 'GET',
    POST = 'POST'
}

export interface Route {
    method: HTTPMethod,
    path: string,
    requestHandler: RequestHandler
}

class Micro extends Function {

    private routes: Route[]
    private middlewares: RequestHandler[]

    constructor() {
        super()
        this.middlewares = []
        this.routes = []
    }

    get(path: string, requestHandler: RequestHandler) {
        this.routes.push({
            method: HTTPMethod.GET,
            path,
            requestHandler
        })
    }

    post(path: string, requestHandler: RequestHandler) {
        this.routes.push({
            method: HTTPMethod.POST,
            path,
            requestHandler
        })
    }

    use(requestHandler: RequestHandler) {
        this.middlewares.push(requestHandler)
    }

    async listen(port: number, callback?: ListenCallback) {

        console.log('\n --- ROUTES --- ')
        console.log(this.routes)

        let server: Server

        try {
            server = serve({ port })
        } catch (error) {
            if (callback) {
                return callback(error)
            }
            throw error
        }

        if (callback) {
            callback()
        }

        for await (const request of server) {
            
            // call each applied middleware
            for (const mw of this.middlewares) {
                mw(request)
            }

            let found = false

            // find the request handler that matches the request paramaters
            for (const route of this.routes) {
                if (route.method === request.method && route.path === request.url) {
                    found = true
                    route.requestHandler(request)
                    break
                }
            }

            if (!found) {
                request.respond({ status: 404, body: '404 Not Found' })
            }
        }

        console.log(`Server stopped listening...`)
    }
}

export default Micro