var socket = io();

socket.on('message', function (data) {
    console.log(data);
});

document.getElementsByClassName("new-game-button")[0].addEventListener('click', () => {
    document.getElementsByClassName('winner-display')[0].innerHTML = ""
    socket.emit('new game')
})
document.getElementsByClassName("toggle-goals-button")[0].addEventListener('click', () => {
    socket.emit('toggle goals')
})

var movement = {
    up: false,
    down: false,
    left: false,
    right: false
}
document.addEventListener('keydown', function (event) {
    switch (event.keyCode) {
        case 65: // A
            movement.left = true;
            break;
        // case 87: // W
        //     movement.up = true;
        //     break;
        case 68: // D
            movement.right = true;
            break;
        // case 83: // S
        //     movement.down = true;
        //     break;
        case 74:
            socket.emit('kickLeft')
            break
        case 76:
            socket.emit('kickRight')
            break
        case 32:
            socket.emit('jump')
            break
    }
});
document.addEventListener('keyup', function (event) {
    switch (event.keyCode) {
        case 65: // A
            movement.left = false;
            break;
        case 87: // W
            movement.up = false;
            break;
        case 68: // D
            movement.right = false;
            break;
        case 83: // S
            movement.down = false;
            break;
    }
});

socket.emit('new player');

// sends out direction bools
setInterval(function () {
    socket.emit('movement', movement);
}, 1000 / 60);

var canvas = document.getElementById('canvas');
canvas.width = 800;
canvas.height = 600;
var context = canvas.getContext('2d');


socket.on('state', function (players, ball, goals, posts) {
    context.clearRect(0, 0, 800, 600);
    context.fillStyle = 'cyan';
    for (var id in players) {
        var player = players[id];
        context.beginPath();
        context.rect(player.x, player.y, player.width, player.height);
        context.fill();
        context.beginPath()
        context.arc(player.x + player.width / 2, player.y, (player.width + 2) / 2, 0, 2 * Math.PI);
        context.fill()
    }
    // Goals
    // context.fillStyle = 'blue';
    // for (var id in goals) {
    //     var goal = goals[id];
    // context.beginPath();
    // context.rect(goal.x, goal.y, goal.width, goal.height);
    // context.fill();
    // }
    // Posts
    context.fillStyle = 'black';
    for (var id in posts) {
        var post = posts[id];
    context.beginPath();
    context.rect(post.x, post.y, post.width, post.height);
    context.fill();
    }
    // ball
    // let fireColor;
    // if (ball.dx + ball.dy) {fireColor = 'blue'}
    // if (ball.dx + ball.dy) {fireColor = 'blue'}
    // if (ball.dx + ball.dy) {fireColor = 'blue'}
     
    context.fillStyle = 'hotpink';

    context.beginPath();
    context.arc(ball.x, ball.y, ball.width / 2, 0, 2 * Math.PI);
    context.fill();
});

socket.on('updateScore', game => {
    document.getElementsByClassName('player1-score')[0].innerHTML = game["player1Score"]
    document.getElementsByClassName('player2-score')[0].innerHTML = game["player2Score"]
})

socket.on('game over', player => {
    document.getElementsByClassName('winner-display')[0].innerHTML = `${player} has won!`
})