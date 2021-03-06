(function(){
    var cnv = document.querySelector('canvas');
    var ctx = cnv.getContext('2d');
    
    if (window.innerWidth >= 650) {
        var tilesize = 64;
        var z = 3;
    }else if (window.innerWidth < 650 && window.innerWidth > 400) {
        var tilesize = 40;
        cnv.width = 400;
        cnv.height = 400;
        var z = 2;
    }else {
        var tilesize = 28;
        cnv.width = 280;
        cnv.height = 280;
        var z = 2;
    }

    var tilescrsize = 96;

    var img = new Image();
        img.src = 'img.png';
        img.addEventListener('load',function() {
            loop()
        },false);

    var walls = [];

    var player = {
        x:tilesize + 5,
        y:tilesize + 5,
        width: tilesize - 10,
        height: tilesize - 10,
        speed: z
    }

    var maze = [
        [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
        [1,0,0,0,1,0,0,1,0,0,0,0,1,0,0,0,0,0,1,1],
        [1,1,1,0,1,1,0,1,1,0,1,0,0,0,1,1,1,0,0,1],
        [1,0,0,0,0,0,0,1,0,0,1,0,1,0,0,0,1,1,0,1],
        [1,0,1,1,0,1,0,1,1,1,1,0,1,1,0,0,0,1,0,1],
        [1,0,1,0,0,1,0,0,0,0,0,0,0,1,1,1,1,1,0,1],
        [1,1,1,0,1,1,0,1,1,1,0,1,0,0,1,0,1,0,0,1],
        [1,0,1,0,0,0,1,1,0,1,0,1,0,1,1,0,1,0,1,1],
        [1,0,1,1,1,0,1,0,0,0,0,0,1,0,0,0,0,0,0,1],
        [1,0,0,0,0,0,1,0,1,1,1,0,1,0,0,1,0,1,1,1],
        [1,1,1,0,1,1,1,0,1,0,0,0,1,0,1,0,0,1,0,1],
        [1,0,0,0,0,0,0,0,1,0,0,1,1,0,1,0,1,1,0,1],
        [1,1,1,1,0,1,1,0,1,0,1,1,0,0,1,0,0,0,0,1],
        [1,0,1,0,0,1,0,0,1,1,1,0,1,0,1,0,1,1,0,1],
        [1,0,0,0,0,1,0,0,0,1,0,0,1,0,1,1,0,1,1,1],
        [1,0,1,1,1,1,1,1,0,1,1,0,0,0,0,1,0,1,0,1],
        [1,0,1,0,0,0,0,1,0,0,1,1,1,1,0,0,0,0,0,1],
        [1,0,0,0,1,1,0,1,1,1,0,0,0,1,0,1,0,1,1,1],
        [1,0,1,0,1,0,0,0,0,0,0,1,0,1,0,1,0,0,0,2],
        [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1]
    ];

    var twidth = maze[0].length * tilesize ,
        theight = maze.length * tilesize;

    for (var row in maze) {
        for (var column in maze[row]) {
            var tile = maze[row][column];
            if (tile === 1) {
                var wall = {
                    x: tilesize * column,
                    y: tilesize * row,
                    width: tilesize,
                    height: tilesize
                };
                walls.push(wall);
            }
        }
    }
    var cam = {
        x: 0,
        y: 0,
        width: cnv.width,
        height: cnv.height,
        innerLeftBoundary: function() {
            return this.x + (this.width*0.25);
        },
        innerTopBoundary: function() {
            return this.y + (this.height*0.25);
        },innerRightBoundary: function() {
            return this.x + (this.width*0.75);
        },innerBottomBoundary: function() {
            return this.y + (this.height*0.75);
        }
    };

    function blockrectangle(objA,objB) {
        var distx = (objA.x + objA.width/2) - (objB.x + objB.width/2);
        var disty = (objA.y + objA.height/2) - (objB.y + objB.height/2);

        var sumwidth = (objA.width + objB.width)/2;
        var sumheight = (objA.height + objB.height)/2;

        if (Math.abs(distx) < sumwidth && Math.abs(disty) < sumheight) {
            var overlapx = sumwidth - Math.abs(distx);
            var overlapy = sumheight - Math.abs(disty);
        
            if (overlapx > overlapy) {
                objA.y = disty > 0 ? objA.y + overlapy : objA.y - overlapy; 
            }else {
                objA.x = distx > 0 ? objA.x + overlapx : objA.x - overlapx; 
            }
        }
    }

    var LEFT = 37 ,UP = 38 , RIGHT = 39, DOWN = 40;
    var mvleft = mvup = mvright = mvdown = false;

    window.addEventListener('keydown',function(e) {
        var key = e.keyCode;
        switch (key) {
            case LEFT:
                mvleft = true;
                break
            case UP:
                mvup = true;
                break
            case RIGHT:
                mvright = true;
                break
            case DOWN:
                mvdown = true;
                break
        }
    });

    window.addEventListener('keyup',function(e) {
        var key = e.keyCode;
        switch (key) {
            case LEFT:
                mvleft = false;
                break
            case UP:
                mvup = false;
                break
            case RIGHT:
                mvright = false;
                break
            case DOWN:
                mvdown = false;
                break
        }
    });

    document.getElementById('controls').addEventListener('touchstart',function(e) {
        if (e.target.classList == 'fas fa-caret-up' || e.target.classList == 'up'){
          mvup = true;
        }
        if (e.target.classList == 'fas fa-caret-left' || e.target.classList == 'left'){
          mvleft = true;
        }
        if (e.target.classList == 'fas fa-caret-down' || e.target.classList == 'down'){
          mvright = true;
        }
        if (e.target.classList == 'fas fa-caret-right' || e.target.classList == 'right'){
          mvdown = true;
        }
      });
      
    document.getElementById('controls').addEventListener('touchend',function(e) {
      mvleft = false;
      mvright = false;
      mvdown = false;
      mvup = false;
    });
    
    function update() {
        cam.innerLeftBoundary = function() {
            return cam.x + (cam.width*0.25);
        },
        cam.innerTopBoundary = function() {
            return cam.y + (cam.height*0.25);
        },
        cam.innerRightBoundary = function() {
            return cam.x + (cam.width*0.75);
        },
        cam.innerBottomBoundary = function() {
            return cam.y + (cam.height*0.75);
        }
        walls.forEach(wall => {
            wall.width = tilesize;
            wall.height = tilesize;
        })
        if (mvleft && !mvright) {
            player.x -= player.speed;
        }else if (!mvleft && mvright) {
            player.x += player.speed;
        }
        if (mvup && !mvdown) {
            player.y -= player.speed;
        }else if (!mvup && mvdown) {
            player.y += player.speed;
        }
        for (var i in walls) {
            var wall = walls[i];
            blockrectangle(player,wall);
        }

        if (player.x < cam.innerLeftBoundary()) {
            cam.x = player.x - (cam.width * 0.25);
        };
        if (player.y < cam.innerTopBoundary()) {
            cam.y = player.y - (cam.height * 0.25);
        }
        if (player.x + player.width > cam.innerRightBoundary()) {
            cam.x = player.x + player.width - (cam.width * 0.75);
        };
        if (player.y + player.height > cam.innerBottomBoundary()) {
            cam.y = player.y + player.height - (cam.height * 0.75);
        };

        cam.x = Math.max(0,Math.min(twidth - cam.width,cam.x));
        cam.y = Math.max(0,Math.min(theight - cam.height,cam.y));
    };

    function render() {
        ctx.clearRect(0,0,cnv.width,cnv.height);
        ctx.save();
        ctx.translate(-cam.x,-cam.y);
        for (var row in maze) {
            for (var column in maze[row]) {
                var tile = maze[row][column];
                var x = column * tilesize;
                var y = row *tilesize;
                if (tile === 1) {
                    ctx.drawImage(
                        img,tilescrsize,0,tilescrsize,tilescrsize,x,y,tilesize,tilesize
                        );
                }
                if (tile == 2) {
                    ctx.fillStyle = '#daa520';
                    ctx.fillRect(x,y,tilesize,tilesize)
                }
            }
        }
        ctx.fillStyle = '#00f';
        ctx.fillRect(player.x,player.y,player.width,player.height);
        ctx.restore();
    };

    function loop() {
        window.requestAnimationFrame(loop,cnv);
        update();
        render();
    };

}());