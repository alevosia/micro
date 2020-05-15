import { serve, Server, ServerRequest, exists, path, readFileStr } from '../deps.ts'

export type RequestHandler = (request: ServerRequest) => any
export type ListenCallback = (error?: any) => void

export enum HTTPMethod {
    GET = 'GET',
    POST = 'POST'
}

export interface Route {
    method: HTTPMethod
    path: string
    requestHandler: RequestHandler
}

export interface Static {
    path: string
    directory: string,
    handler: RequestHandler
}

class Micro {

    private routes: Route[]
    private staticConfig: Static | null
    private middlewares: RequestHandler[]

    constructor() {
        this.staticConfig = null
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

    static(staticPath: string, staticDirectory: string) {

        const staticHandler = async (request: ServerRequest) => {

            const urlArr = request.url.split('/').slice(2)
            const fileUrl = urlArr.reduce((previous, current) => {
                return previous.concat(`/${current}`)
            }, '')

            const staticFilePath = path.join(staticDirectory, fileUrl)
            
            console.log(staticFilePath)

            if (!await exists(staticFilePath)) {
                return request.respond({ status: 404, body: 'Static File NOT Found'})
            }
        
            const file = await readFileStr(staticFilePath)
            return request.respond({ body: file })
        }

        this.staticConfig = {
            path: staticPath,
            directory: staticDirectory,
            handler: staticHandler
        }
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
            
            console.log(request.url)
            console.log(this.staticConfig?.path)

            // call each applied middleware
            for (const mw of this.middlewares) {
                mw(request)
            }

            let found = false

            // find the request handler that matches the request paramaters
            for (const route of this.routes) {

                if (this.staticConfig && this.staticConfig.path && request.url.startsWith(this.staticConfig.path)) {
                    found = true
                    this.staticConfig.handler(request)
                    break
                }

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