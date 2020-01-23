var express = require('express');
var http = require('http');
var path = require('path');
var socketIO = require('socket.io'); var app = express();
var server = http.Server(app);
var io = socketIO(server); app.set('port', 3000);


var port = process.env.PORT || 3000

app.use('/static', express.static(__dirname + '/static'));
app.get('/', function (request, response) {
    response.sendFile(path.join(__dirname, 'index.html'));
});
server.listen(port, function () {
    console.log('Starting server on port 3000');
});


io.on('connection', function (socket) {
    socket.on('disconnect', function () {
        console.log(`${socket.id} disconnected`);
        delete players[socket.id]
    });

    socket.on('new player', function () {
        players[socket.id] = {
            x: 300,
            y: 550,
            width: 20,
            height: 50,
            dx: 0,
            dy: 0,
        };
        console.log(players)

    });
    socket.on('movement', function (data) {
        var player = players[socket.id] || {};
        if (data.left && player.x !== 0) {
            player.x -= 5;
        }
        // if (data.up) {
        //     player.y -= 5;
        // }
        if (data.right && player.x !== 800 - player.width) {
            player.x += 5;
        }
        // if (data.down && player.y !== 600) {
        //     player.y += 5;
        // }
    });
    socket.on('kickLeft', function(data) {
        var player = players[socket.id] || {};
        if (collided(player, ball)) {
            while (collided(player, ball)) ball.x -= 1
            ball.dx -= 20 + player.dx
            ball.dy -= 40 + player.dy
            }
    })
    socket.on('kickRight', function(data) {
        var player = players[socket.id] || {};
        if (collided(player, ball)) {
            while (collided(player, ball)) ball.x += 1
            ball.dx += 20 + player.dx
            ball.dy -= 40 + player.dy
            }
    })
    socket.on('jump', function(data) {
        var player = players[socket.id] || {};
            player.dy -= 25
    })

    socket.on('new game', () => {
        resetBall()
        game["player1Score"] = 0
        game["player2Score"] = 0
        io.sockets.emit('updateScore', game)
    })
    socket.on('toggle goals', ()=>{
        for (id in goals) {
            goals[id].y === 500 ? goals[id].y = 400 : goals[id].y = 500;
        }
    })
}); 


// function canMove(obj, dir) {
//     switch (dir) {
//         case "left":
//             return obj.x - (obj.width / 2) + obj.dx >= 0
//         case "right":
//             return obj.x + (obj.width / 2) + obj.dx <= 800 
//         case "up":
//             return obj.y - (obj.height / 2) + obj.dy >= 0
//         case "down":
//             return obj.y + (obj.height / 2) + obj.dy <= 600
//     }  
// }

var canvas = {
    width: 800,
    height: 600,
}

var players = { };

var ball = {
    x: 400,
    y: 570,
    width: 20,
    height: 20,
    dx: 0,
    dy: 0,
}
var posts = {
    topLeft: {
        x: 0,
        y: 390,
        height: 10,
        width: 50,
    },
    bottomLeft: {
        x: 0,
        y: 500,
        height: 10,
        width: 100,
    },
    topRight: {
        x: 750,
        y: 390,
        height: 10,
        width: 50,
    },
    bottomRight: {
        x: 700,
        y: 500,
        height: 10,
        width: 100,
    }
}
var goals = {1: {x: 0,
                y: 400,
                height: 100,
                width: 50,
                },
            2: {x: 750,
                y: 400,
                height: 100,
                width: 50,
                }
}   
var game = {
    player1Score: 0,
    player2Score: 0,
}

function collided(obj1, obj2) {
    // canvas draws starting from top left
    return obj1.x < obj2.x + obj2.width &&
        obj1.x + obj1.width > obj2.x &&
        obj1.y < obj2.y + obj2.height &&
        obj1.y + obj1.height > obj2.y
}
// function canHit(hitter, target) {
//     return hitter.x - 20 < target.x + target.width &&
//         hitter.x + hitter.width + 30 > target.x &&
//         hitter.y - 20 < target.y + target.height &&
//         hitter.y + hitter.height + 30 > target.y
// }

function resetBall(){
    ball.x = 400
    ball.y = 570    
    ball.dx = 0
    ball.dy = 0
}
// Gravity (y) and Wind Resistance (x)
setInterval(function () {
    let playerBallCollided;
    let postBallCollided;
    for (id in players) {
        var player = players[id];
        player.x += player.dx
        player.y += player.dy
        player.dy += 2
        // prevent falling thru ground
        if (player.y + player.height >= canvas.height) {
            player.y = canvas.height - player.height
            player.dy = 0
        }
        // prevent going through posts
        for (post in posts) {
            if (collided(player, posts[post])) { 
                player.dx = 0
                player.dy = 0 
                while (collided(player, posts[post])) {
                    player.dy < 0 ? player.y += 1 : player.y -= 1
                }
            }
        }
        
        if (collided(player, ball)) playerBallCollided = true
    }
    // check if ball hit a post
    for (post in posts) {
        if (collided(ball, posts[post])) {postBallCollided = true}
    }
    // ball bounces off walls
    if (ball.x + ball.dx > canvas.width - ball.width / 2 || ball.x + ball.dx < ball.width / 2 || playerBallCollided) {
        ball.dx = -ball.dx
    }
    if (ball.y + ball.dy > canvas.height - ball.height / 2 || ball.y + ball.dy < ball.height / 2 || postBallCollided) {
        ball.dy = -ball.dy
    }

    if (ball.y !== 590) { ball.dy += 2 }
    else {
        // going down -> slow down
        if (ball.dy > 0) { ball.dy -= 1 }
        // going up -> slow down
        else if (ball.dy < 0) { ball.dy += 1 }
    }
    
    ball.x += ball.dx
    ball.y += ball.dy
    
    // put the ball back in bounds
    // if (ball.y + ball.radius >= canvas.height) { 
    //     ball.y = canvas.height - ball.height
    //     ball.dy = 0 
    //     }
    // if (ball.x + ball.radius >= canvas.width) { 
    //     ball.x = canvas.width - ball.width
    //     ball.dx = 0 
    //     }

    

}, 1000 / 60)


// Check for Goal
setInterval(function () {
    let scoringPlayer = null
    if (collided(goals[1], ball)) {
        scoringPlayer = "player2"
        game["player2Score"] += 1
    }
    if (collided(goals[2], ball)) {
        scoringPlayer = "player1"
        game["player1Score"] += 1
    }
    if (scoringPlayer) {
        ball.dx = 0
        ball.dy = 0
        // setTimeout(()=> {
            io.sockets.emit('updateScore', game)
            resetBall()
        // }, 2000)
        
    }
    if (game["player2Score"] === 5 || game["player1Score"] === 5) {
        if (game["player1Score"] === 5) io.sockets.emit('game over', "Player 1")
        if (game["player2Score"] === 5) io.sockets.emit('game over', "Player 2")
        setTimeout(() => {game["player1Score"] = 0
                        game["player2Score"] = 0
                        io.sockets.emit('updateScore', game)}, 3000)
    }
}, 1000 / 60)

// Visual state
setInterval(function () {
    io.sockets.emit('state', players, ball, goals, posts);
}, 1000 / 60);