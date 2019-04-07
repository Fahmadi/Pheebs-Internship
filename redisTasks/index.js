const http = require('http')
const redis = require('./redis')



const server = http.createServer(async (req,res) => {
    const ses = await redis.hset('userCount:value','userCount', 1)
    console.log(ses)
    if(req.url === '/favicon.ico'){
        console.log('favicon');
        return;
    }

    await res.writeHead(200, { 'Content-Type': 'text/plain' });
    await res.write('Hello!\n');
    // const userCount = await redis.hget('userCount:value','userCount')
    const userCount = await redis.incr('userCount')
    await res.write('We have had ' + userCount + ' visits!\n');
    await res.end();
})
server.listen(8888)