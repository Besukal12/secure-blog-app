import http from 'http'
import dotenv from 'dotenv'
import app from './app'
import { connectToDB } from './config/db'

dotenv.config()

const port = process.env.PORT || 5000

async function startServer() {
    connectToDB()

    const server = http.createServer(app)
    server.listen(port, () => {
        console.log(`Server is listening to port ${port}`);
    })
}

startServer().catch((err) => {
    console.error("Error occured while server is starting", err);
})