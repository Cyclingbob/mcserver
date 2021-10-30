const express = require('express')
const bodyParser = require('body-parser');
const cookieParser = require("cookie-parser");

const app = express()
app.use('/public', express.static(__dirname + "/public"))
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(bodyParser.json());
app.use(bodyParser.raw());

app.get('/', (req, res) => {
    res.sendFile(__dirname + '/views/index.html')
})

app.listen(80)

const spawn = require('child_process').spawn;

const minecraftServerProcess = spawn('java', [
    '-Xmx1024M',
    '-Xms1024M',
    '-jar',
    'server.jar',
    'nogui'
]);

process.stdin.resume();

function exitHandler(options, exitCode) {
    if (options.cleanup) console.log('clean');
    if (exitCode || exitCode === 0) console.log(exitCode);

    // minecraftServerProcess.stdin.write('stop')

    if (options.exit) process.exit();
}

process.on('exit', exitHandler.bind(null,{cleanup:true}));

//catches ctrl+c event
process.on('SIGINT', exitHandler.bind(null, {exit:true}));

// catches "kill pid" (for example: nodemon restart)
process.on('SIGUSR1', exitHandler.bind(null, {exit:true}));
process.on('SIGUSR2', exitHandler.bind(null, {exit:true}));

//catches uncaught exceptions
process.on('uncaughtException', exitHandler.bind(null, {exit:true}));

function log(data) {
    process.stdout.write(data.toString());
}

const WebSocket = require('ws');
const wss = new WebSocket.Server({ port: 8080, path: "/console"});

wss.on('connection', function connection(ws){

    minecraftServerProcess.stdout.on('data', function(data){ ws.send(data.toString()); log(data.toString()) });
    minecraftServerProcess.stderr.on('data', function(data){ ws.send(data.toString()); log(data.toString()) });

    minecraftServerProcess.on('exit', () => {
        ws.send('Server stopped.')
        process.exit()
    })

    ws.on('message', function incoming(message){

        console.log(message)

        minecraftServerProcess.stdin.write(message + '\n')
        // var stdout

        // exec(message, (error, stdout, stderr) => {
        //     if (error) {
        //         ws.send(error.toString().split('\n').join('<br>') + '<br>');
        //         return;
        //     }
        //     if (stderr) {
        //         console.log(`stderr: ${stderr}`);
        //         return;
        //     }

        //     stdout = stdout            

        //     wss.clients.forEach(function each(client) {
        //         if (client !== ws && client.readyState === WebSocket.OPEN) {
        //             ws.send(stdout.toString().split('\n').join('<br>') + '<br>')
        //         }
        //     })

        // });
    });
});