
var TetrisGame = {
    points: 0,
    level: 1000,
    defaultOptions: {
        boardCanvasId: "board",
        headsUpCanvasId: "headsUp",
        frozenCanvasId: "frozen",
        widthInputId: "width",
        pointOutputId: "points"
    },
    tetriminosDefinition: {
        L: { "blocks": [0x4460, 0x0E80, 0xC440, 0x2E00], "color": "#F6A207" },
        J: { "blocks": [0x44C0, 0x8E00, 0x6440, 0x0E20], "color": '#3439C4' },
        I: { "blocks": [0x0F00, 0x2222, 0x00F0, 0x4444], "color": '#07F6EA' },
        O: { "blocks": [0xCC00, 0xCC00, 0xCC00, 0xCC00], "color": '#A207F6' },
        S: { "blocks": [0x06C0, 0x8C40, 0x6C00, 0x4620], "color": '#950C21' },
        Z: { "blocks": [0x0C60, 0x4C80, 0xC600, 0x2640], "color": '#F2F607' },
        T: { "blocks": [0x0E40, 0x4C40, 0x4E00, 0x4640], "color": '#09B212' }
    },


    start: function (optionsArg = {}) {
        var options = Object.assign(this.defaultOptions, optionsArg);
        this.tetriminos = Object.values(this.tetriminosDefinition);
        this.points = 0;
        this.level = 1000;
        if (typeof this.currentTetrimino !== 'undefined') {
            clearInterval(this.currentTetrimino.interval);
        }

        this.boardCanvas = document.getElementById(options.boardCanvasId);
        this.ctxBoard = this.boardCanvas.getContext("2d");
        var width = document.getElementById(options.widthInputId).value;
        var a = width / this.boardCanvas.width;

        this.boardCanvas.width = width;
        this.boardCanvas.height *= a;

        this.headsUpCanvas = document.getElementById(options.headsUpCanvasId);
        this.ctxHeadsUp = this.headsUpCanvas.getContext("2d");

        this.frozenTetriminoCanvas = document.getElementById(options.frozenCanvasId);
        this.ctxFrozen = this.frozenTetriminoCanvas.getContext("2d");

        this.frozen = null;
        this.size = this.boardCanvas.width / 10;
        this.boardCanvas.style.backgroundSize = 2 * this.size + "px " + 2 * this.size + "px";
        //kontekst rysowania;
        this.ctxBoard.clearRect(0, 0, this.boardCanvas.width, this.boardCanvas.height);

        /* [y][x]
        numer wiersza, numer kolumny */
        this.boardModel = [];
        for (var i = 0; i < 20; i++) {
            this.boardModel[i] = [];
            for (var j = 0; j < 10; j++) {
                this.boardModel[i][j] = []
                this.boardModel[i][j][0] = false; // zajety, czy nie
                this.boardModel[i][j][1] = "none"; // color

            }

        }

        this.pointsDOMContainer = document.getElementById(options.pointOutputId);


        this.queue = [];
        this.queue.push(Math.floor((Math.random() * 7)));

        this.nextTetrimino();
        this.bindKeyEvents();
    },

    nextTetrimino: function (next = false) {
        this.queue[1] = Math.floor((Math.random() * 7));
        if (next !== false) {
            this.queue[1] = next;
        }
        this.currentTetrimino = new Tetrimino(0, -this.size * 2, this.tetriminos[this.queue[0]], this.queue[0]);
        this.currentTetrimino.start();
        this.drawHeadsUp(this.tetriminos[this.queue[1]]);
        this.queue[0] = this.queue[1];
    },



    freeze: function () {
        if (this.frozen == null) {
            this.frozen = this.currentTetrimino;

            this.drawFrozen(this.frozen.tetrimino);
            clearInterval(this.frozen.interval);
            this.frozen.clear();
            this.frozen.x = 0;
            this.frozen.y = -2 * this.size;
            this.nextTetrimino();
        }
        else {
            this.queue[0] = this.frozen.pozycja;
            this.frozen = this.currentTetrimino;
            this.drawFrozen(this.frozen.tetrimino);
            clearInterval(this.frozen.interval);
            this.frozen.clear();
            this.frozen.x = 0;
            this.frozen.y = -2 * this.size;
            this.nextTetrimino(this.queue[1]);
        }

    },
    drawHeadsUp: function (tetrimino) {
        col = row = 0;
        var size = 25;
        this.ctxHeadsUp.clearRect(0, 0, this.headsUpCanvas.width, this.headsUpCanvas.height);
        x = 0;
        y = 0;
        indeks = Math.floor((Math.random() * 4));
        for (bit = 0x8000; bit > 0; bit = bit >> 1) {
            this.ctxHeadsUp.fillStyle = tetrimino["color"];
            this.ctxHeadsUp.strokeStyle = "#FFFFFF";
            if (bit & tetrimino["blocks"][indeks]) {
                this.ctxHeadsUp.fillRect(x + size * col + 2, y + size * row + 2, size - 8, size - 8);
                this.ctxHeadsUp.strokeRect(x + size * col + 2, y + size * row + 2, size - 4, size - 4);
            }
            col = (col + 1) % 4;
            if (col == 0)
                ++row;

        }
    },

    drawFrozen: function (tetrimino) {
        col = row = 0;
        var size = 25;
        this.ctxFrozen.clearRect(0, 0, this.frozenTetriminoCanvas.width, this.frozenTetriminoCanvas.height);
        x = 0;
        y = 0;
        indeks = Math.floor((Math.random() * 4));
        for (bit = 0x8000; bit > 0; bit = bit >> 1) {
            this.ctxFrozen.fillStyle = tetrimino["color"];
            this.ctxFrozen.strokeStyle = "#FFFFFF";
            if (bit & tetrimino["blocks"][indeks]) {
                this.ctxFrozen.fillRect(x + size * col + 2, y + size * row + 2, size - 8, size - 8);
                this.ctxFrozen.strokeRect(x + size * col + 2, y + size * row + 2, size - 4, size - 4);
            }
            col = (col + 1) % 4;
            if (col == 0)
                ++row;

        }
    },

    checkBoardState: function () {
        for (var i = 0; i < 20; i++) {
            var counter = 0;
            for (var j = 0; j < 10; j++) {
                if (this.boardModel[i][j][0] == true)
                    ++counter;
                else
                    break;

            }


            if (counter == 10) {
                for (var col = 0; col < 10; ++col)
                    this.boardModel[i][col][0] = false;
                this.points++;
                if (this.level >= 200 && this.points % 10 === 0)
                    this.level -= 100;
                this.pointsDOMContainer.innerHTML = this.points;
                this.ctxBoard.clearRect(0, i * this.size, this.size * 10, this.size);
                if (i > 1)
                    this.moveRowsDown(i);

            }




        }

    },

    moveRowsDown: function (row) {
        this.ctxBoard.strokeStyle = "#FFFFFF";
        for (var i = row - 1; i >= 0; --i) {
            for (var j = 0; j < 10; j++) {
                if (this.boardModel[i][j][0] == true) {
                    this.ctxBoard.clearRect(this.size * j, this.size * i, this.size, this.size);
                    //ctxBoard.fillStyle="#AAAAFF";
                    this.ctxBoard.fillStyle = this.boardModel[i][j][1];
                    this.ctxBoard.fillRect(this.size * j + 2, this.size * i + 2 + this.size, this.size - 8, this.size - 8);
                    this.ctxBoard.strokeRect(this.size * j + 2, this.size * i + 2 + this.size, this.size - 4, this.size - 4);
                    this.boardModel[i][j][0] = false;
                    this.boardModel[i + 1][j][0] = true;
                }
            }

        }
    },

    bindKeyEvents: function () {
        var self = this;
        document.onkeydown = function (e) {
            // w lewo -37, w gore 38, w prawo 39, w dol 40, z 90, x 88
            //	alert(e.keyCode);
            if (e.keyCode == 40) {
                //strzalka w dol
                e.preventDefault();
                self.currentTetrimino.accelerate();
            }
            else if (e.keyCode == 37) {
                e.preventDefault();
                //strzalka w lewo
                self.currentTetrimino.moveLeft();
            }
            else if (e.keyCode == 39) {
                e.preventDefault();
                //strzalka w prawo
                self.currentTetrimino.moveRight();
            }
            else if (e.keyCode == 90 || e.keyCode == 89) {
                e.preventDefault();
                //z
                self.currentTetrimino.turnCounterClockwise();
            }
            else if (e.keyCode == 88 || e.keyCode == 38) {
                e.preventDefault();
                //x
                self.currentTetrimino.turnClockWise();
            }
            else if (e.keyCode == 67) {
                e.preventDefault();
                //c
                self.freeze();
            }
        }

        document.onkeyup = function (e) {


            if (e.keyCode == 40) {
                e.preventDefault();
                //strzalka w dol
                self.currentTetrimino.slowDown();
            }
            else if (e.keyCode == 32) {
                e.preventDefault();
                //c
                self.currentTetrimino.drop();
            }

        }

        document.addEventListener('touchstart', handleTouchStart, false);
        //	document.addEventListener('touchend', handleTouchEnd, false);
        document.addEventListener('touchmove', handleTouchMove, false);


        var xDown = null;
        var yDown = null;

        var xDown2 = null;
        function handleTouchStart(evt) {
            xDown = evt.touches[0].clientX;
            yDown = evt.touches[0].clientY;

            xDown2 = xDown;
            //alert(evt.touches[0].force);
            //half=window.innerWidth/2;
            /*if(xDown>half)
                this.currentTetrimino.turnClockWise();
            else 
                this.currentTetrimino.turnCounterClockwise();*/

        };

        function handleTouchEnd(evt) {
            x = evt.touches[0].clientX;
            y = evt.touches[0].clientY;
            //alert(evt.touches[0].force);
            half = window.innerWidth / 2;
            alert("x " + x + " xDown" + xDown + " half " + half);
            if (Math.abs(x - xDown2) < 30) {
                if (x > half)
                    self.currentTetrimino.turnClockWise();
                else
                    self.currentTetrimino.turnCounterClockwise();
            }
            xDown2 = null;

        };

        function handleTouchMove(evt) {
            if (!xDown || !yDown) {
                return;
            }
            evt.preventDefault();
            var xUp = evt.touches[0].clientX;
            var yUp = evt.touches[0].clientY;

            var xDiff = xDown - xUp;
            var yDiff = yDown - yUp;

            if (Math.abs(xDiff) > Math.abs(yDiff)) {/*most significant*/
                if (xDiff > 0) {
                    /* left swipe */
                    for (i = 0; i < xDiff / 15; ++i)
                        self.currentTetrimino.moveLeft();
                } else {
                    /* right swipe */
                    for (i = 0; i < -xDiff / 15; ++i)
                        self.currentTetrimino.moveRight();
                }

            } else {
                if (yDiff > 0) {
                    /* up swipe */
                    //	this.currentTetrimino.slowDown();
                    self.currentTetrimino.turnClockWise();
                } else {
                    /* down swipe */
                    if (self.currentTetrimino.isAccelerating == false)
                        self.currentTetrimino.accelerate();
                    else
                        self.currentTetrimino.slowDown();
                }


            }

            xDown = null;
            yDown = null;

        }
    }
}

function Tetrimino(x, y, tetrimino, pos) {
    var self = this;
    self.tetrimino = tetrimino;
    self.pozycja = pos;
    self.color = tetrimino["color"]
    self.blocks = tetrimino["blocks"];
    self.orientation = 0;
    self.block = self.blocks[self.orientation];
    self.x = x;
    self.y = y;
    self.ghostX;
    self.ghostY;
    self.dy = TetrisGame.size;
    self.dx = 0;
    self.interval;
    self.isAccelerating = false

    /* indeks z x lub y ixy*/
    self.ixy = function (z) {
        return z / TetrisGame.size;
    },

        self.detectCollision = function (x, y, direction) {
            col = 0;
            row = 0;
            block = self.blocks[direction];
            for (bit = 0x8000; bit > 0; bit = bit >> 1) {

                if (bit & block) {
                    xx = x + TetrisGame.size * col;
                    yy = y + TetrisGame.size * row;

                    if (self.ixy(xx) >= 0 && self.ixy(xx) < 10 && self.ixy(yy) >= 0 && self.ixy(yy) < 20)
                        if (TetrisGame.boardModel[self.ixy(yy)][self.ixy(xx)][0] == true)
                            return true;
                    if (xx < 0 || xx + TetrisGame.size > TetrisGame.boardCanvas.width || yy + TetrisGame.size > TetrisGame.boardCanvas.height)
                        return true;
                }
                col = (col + 1) % 4;
                if (col == 0)
                    ++row;

            }
            return false;

        }
    self.draw = function (ghost = true) {
        col = 0;
        row = 0;
        x = self.x;
        y = self.y;
        for (bit = 0x8000; bit > 0; bit = bit >> 1) {
            TetrisGame.ctxBoard.fillStyle = self.color;
            TetrisGame.ctxBoard.strokeStyle = "#FFFFFF";
            if (bit & self.block) {
                TetrisGame.ctxBoard.fillRect(x + TetrisGame.size * col + 2, y + TetrisGame.size * row + 2, TetrisGame.size - 8, TetrisGame.size - 8);
                TetrisGame.ctxBoard.strokeRect(x + TetrisGame.size * col + 2, y + TetrisGame.size * row + 2, TetrisGame.size - 4, TetrisGame.size - 4);
            }
            col = (col + 1) % 4;
            if (col == 0)
                ++row;

        }

        if (ghost)
            self.drawGhost();
    }

    self.drawGhost = function () {
        ghost_y = 0;
        while (!self.detectCollision(self.x, self.y + ghost_y, self.orientation)) {
            ghost_y += TetrisGame.size;
        }
        x = self.x;
        y = self.y + ghost_y - TetrisGame.size;
        self.ghostX = x;
        self.ghostY = y;
        col = row = 0;
        for (bit = 0x8000; bit > 0; bit = bit >> 1) {
            TetrisGame.ctxBoard.fillStyle = "rgba(0, 0, 0, 0.7)"
            if (bit & self.block) {
                TetrisGame.ctxBoard.fillRect(x + TetrisGame.size * col, y + TetrisGame.size * row, TetrisGame.size, TetrisGame.size);

            }
            col = (col + 1) % 4;
            if (col == 0)
                ++row;

        }
    }

    self.clear = function () {
        col = 0;
        row = 0;

        x = self.x;
        y = self.y;
        for (bit = 0x8000; bit > 0; bit = bit >> 1) {

            if (bit & self.block) {

                TetrisGame.ctxBoard.clearRect(x + TetrisGame.size * col, y + TetrisGame.size * row, TetrisGame.size, TetrisGame.size);
            }

            col = (col + 1) % 4;
            if (col == 0)
                ++row;

        }
        self.clearGhost();

    }

    self.clearGhost = function () {
        col = 0;
        row = 0;
        x = self.ghostX;
        y = self.ghostY;
        for (bit = 0x8000; bit > 0; bit = bit >> 1) {

            if (bit & self.block) {

                TetrisGame.ctxBoard.clearRect(x + TetrisGame.size * col, y + TetrisGame.size * row, TetrisGame.size, TetrisGame.size);
            }

            col = (col + 1) % 4;
            if (col == 0)
                ++row;

        }

    }

    self.goDown = function () {
        if (self.detectCollision(self.x, self.y + self.dy, self.orientation)) {
            //setTimeout(self.stop,2500);
            self.stop();
            return 0;

        }
        self.clear();
        self.y += self.dy;
        self.draw();
    }
    self.start = function () {

        self.interval = setInterval(self.goDown, TetrisGame.level);

    }

    self.stop = function () {
        clearInterval(self.interval);
        self.clearGhost();
        self.draw(false);
        col = 0;
        row = 0;
        for (bit = 0x8000; bit > 0; bit = bit >> 1) {

            if (bit & self.block) {

                TetrisGame.boardModel[self.ixy(self.y + TetrisGame.size * row)][self.ixy(self.x + TetrisGame.size * col)][0] = true;
                TetrisGame.boardModel[self.ixy(self.y + TetrisGame.size * row)][self.ixy(self.x + TetrisGame.size * col)][1] = self.color;
                if (self.ixy(self.y) == 19) {
                    //dis.style.display = "block";
                }
            }
            col = (col + 1) % 4;
            if (col == 0)
                ++row;

        }


        TetrisGame.checkBoardState();
        TetrisGame.nextTetrimino();
    }

    self.accelerate = function () {
        if (self.isAccelerating == false) {
            clearInterval(self.interval);
            self.interval = setInterval(self.goDown, 100);
            self.isAccelerating = true;
        }
    }

    self.drop = function () {
        clearInterval(self.interval);
        self.interval = setInterval(self.goDown, -100);

    }

    self.slowDown = function () {
        if (self.isAccelerating == true) {
            clearInterval(self.interval);
            self.interval = setInterval(self.goDown, TetrisGame.level);
            self.isAccelerating = false;
        }
    }

    self.moveLeft = function () {
        self.dx = -TetrisGame.size;
        if (self.detectCollision(self.x + self.dx, self.y, self.orientation)) {
            return 0;
        }

        self.clear();
        self.x += self.dx;
        self.draw();

    }

    self.moveRight = function () {
        self.dx = TetrisGame.size;

        if (self.detectCollision(self.x + self.dx, self.y, self.orientation)) {
            return 0;
        }
        self.clear();
        self.x += self.dx;
        self.draw();

    }

    self.turnCounterClockwise = function () {
        if (self.detectCollision(self.x, self.y, (self.orientation + 3) % 4)) {
            return 0;

        }
        self.orientation = (self.orientation + 3) % 4;
        self.clear();
        self.block = self.blocks[self.orientation];
        self.draw();

    }

    self.turnClockWise = function () {
        if (self.detectCollision(self.x, self.y, (self.orientation + 1) % 4)) {
            return 0;
        }
        else {
            self.orientation = (self.orientation + 1) % 4;
            self.clear();
            self.block = self.blocks[self.orientation];
            self.draw();
        }
    }
}