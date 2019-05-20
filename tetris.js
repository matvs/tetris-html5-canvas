
function startGame() {
    var points = 0;
    var level = 1000;
    if (typeof currentTetrimino !== 'undefined') {
        clearInterval(currentTetrimino.interval);
    }

    var boardCanvas = document.getElementById("board"); 
    var ctxBoard = boardCanvas.getContext("2d"); 
    var width = document.getElementById("width").value;
    var a = width / boardCanvas.width;
  
    boardCanvas.width = width;
    boardCanvas.height *= a;

    var headsUpCanvas = document.getElementById("headsUp");
    var ctxHeadsUp = headsUpCanvas.getContext("2d");

    var frozenTetriminoCanvas = document.getElementById("frozen");
    var ctxFrozen = frozenTetriminoCanvas.getContext("2d");

    var frozen = null;
    var size = boardCanvas.width / 10;
    boardCanvas.style.backgroundSize = 2 * size + "px " + 2 * size + "px";
//kontekst rysowania;
    ctxBoard.clearRect(0, 0, boardCanvas.width, boardCanvas.height);

    /* [y][x]
    numer wiersza, numer kolumny */
    var boardModel = [];
    for (var i = 0; i < 20; i++) {
        boardModel[i] = [];
        for (var j = 0; j < 10; j++) {
            boardModel[i][j] = []
            boardModel[i][j][0] = false; // zajety, czy nie
            boardModel[i][j][1] = "none"; // color

        }

    }

    var pointsDOMContainer = document.getElementById("points");

    /* indeks z x lub y ixy*/
    function ixy(z) {
        return z / size;
    }



    var L = { "blocks": [0x4460, 0x0E80, 0xC440, 0x2E00], "color": "#F6A207" };
    var J = { "blocks": [0x44C0, 0x8E00, 0x6440, 0x0E20], "color": '#3439C4' };
    var I = { "blocks": [0x0F00, 0x2222, 0x00F0, 0x4444], "color": '#07F6EA' };
    var O = { "blocks": [0xCC00, 0xCC00, 0xCC00, 0xCC00], "color": '#A207F6' };
    var S = { "blocks": [0x06C0, 0x8C40, 0x6C00, 0x4620], "color": '#950C21' };
    var Z = { "blocks": [0x0C60, 0x4C80, 0xC600, 0x2640], "color": '#F2F607' };
    var T = { "blocks": [0x0E40, 0x4C40, 0x4E00, 0x4640], "color": '#09B212' };

    tetriminos = [L, J, I, O, S, Z, T]
    queue = [];
    queue.push(Math.floor((Math.random() * 7)));
    function nextTetrimino(next = false) {

        /*wylosowany=Math.floor((Math.random() * 7));
        currentTetrimino=new Tetrimino(0,-size*2,tetriminos[wylosowany]);
        currentTetrimino.start();*/
        queue[1] = Math.floor((Math.random() * 7));
        if (next !== false) {
            queue[1] = next;
        }
        currentTetrimino = new Tetrimino(0, -size * 2, tetriminos[queue[0]], queue[0]);
        currentTetrimino.start();
        drawHeadsUp(tetriminos[queue[1]]);
        queue[0] = queue[1];

    }

    nextTetrimino();

    function freeze() {
        if (frozen == null) {
            frozen = currentTetrimino;

            drawFrozen(frozen.tetrimino);
            clearInterval(frozen.interval);
            frozen.clear();
            frozen.x = 0;
            frozen.y = -2 * size;
            nextTetrimino();
        }
        else {
            queue[0] = frozen.pozycja;
            frozen = currentTetrimino;
            drawFrozen(frozen.tetrimino);
            clearInterval(frozen.interval);
            frozen.clear();
            frozen.x = 0;
            frozen.y = -2 * size;
            nextTetrimino(queue[1]);
        }

    }
    function drawHeadsUp(tetrimino) {
        col = row = 0;
        var size = 25;
        ctxHeadsUp.clearRect(0, 0, headsUpCanvas.width, headsUpCanvas.height);
        x = 0;
        y = 0;
        indeks = Math.floor((Math.random() * 4));
        for (bit = 0x8000; bit > 0; bit = bit >> 1) {
            ctxHeadsUp.fillStyle = tetrimino["color"];
            ctxHeadsUp.strokeStyle = "#FFFFFF";
            if (bit & tetrimino["blocks"][indeks]) {
                ctxHeadsUp.fillRect(x + size * col + 2, y + size * row + 2, size - 8, size - 8);
                ctxHeadsUp.strokeRect(x + size * col + 2, y + size * row + 2, size - 4, size - 4);
            }
            col = (col + 1) % 4;
            if (col == 0)
                ++row;

        }
    }

    function drawFrozen(tetrimino) {
        col = row = 0;
        var size = 25;
        ctxFrozen.clearRect(0, 0, frozenTetriminoCanvas.width, frozenTetriminoCanvas.height);
        x = 0;
        y = 0;
        indeks = Math.floor((Math.random() * 4));
        for (bit = 0x8000; bit > 0; bit = bit >> 1) {
            ctxFrozen.fillStyle = tetrimino["color"];
            ctxFrozen.strokeStyle = "#FFFFFF";
            if (bit & tetrimino["blocks"][indeks]) {
                ctxFrozen.fillRect(x + size * col + 2, y + size * row + 2, size - 8, size - 8);
                ctxFrozen.strokeRect(x + size * col + 2, y + size * row + 2, size - 4, size - 4);
            }
            col = (col + 1) % 4;
            if (col == 0)
                ++row;

        }
    }

    function checkBoardState() {
        for (var i = 0; i < 20; i++) {
            var licznik = 0;
            for (var j = 0; j < 10; j++) {
                if (boardModel[i][j][0] == true)
                    ++licznik;
                else
                    break;

            }


            if (licznik == 10) {
                console.log("Czyszcze " + (j * 30) + " " + (i * 30));

                for (var kolumna = 0; kolumna < 10; ++kolumna)
                    boardModel[i][kolumna][0] = false;
                points++;
                if (level >= 200 && points % 10 === 0)
                    level -= 100;
                pointsDOMContainer.innerHTML = points;
                //ctxBoard.clearRect(j*30,i*30,size*10,size); ALE ZE MNIE IDIOTA
                ctxBoard.clearRect(0, i * size, size * 10, size);
                if (i > 1)
                    wszystko_w_dol(i);

            }




        }

    }

    function wszystko_w_dol(wiersz) {
        ctxBoard.strokeStyle = "#FFFFFF";
        for (var i = wiersz - 1; i >= 0; --i) {
            for (var j = 0; j < 10; j++) {
                if (boardModel[i][j][0] == true) {
                    console.log("kolumna " + j + " wiersz " + i + " jest zajeta komorka");
                    ctxBoard.clearRect(size * j, size * i, size, size);
                    //ctxBoard.fillStyle="#AAAAFF";
                    ctxBoard.fillStyle = boardModel[i][j][1];
                    ctxBoard.fillRect(size * j + 2, size * i + 2 + size, size - 8, size - 8);
                    ctxBoard.strokeRect(size * j + 2, size * i + 2 + size, size - 4, size - 4);
                    boardModel[i][j][0] = false;
                    boardModel[i + 1][j][0] = true;
                }
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
        self.dy = size;
        self.dx = 0;
        self.interval;
        self.isAccelerating = false



        self.detectCollision = function (x, y, direction) {
            col = 0;
            row = 0;
            block = self.blocks[direction];
            for (bit = 0x8000; bit > 0; bit = bit >> 1) {

                if (bit & block) {
                    xx = x + size * col;
                    yy = y + size * row;

                    if (ixy(xx) >= 0 && ixy(xx) < 10 && ixy(yy) >= 0 && ixy(yy) < 20)
                        if (boardModel[ixy(yy)][ixy(xx)][0] == true)
                            return true;
                    if (xx < 0 || xx + size > boardCanvas.width || yy + size > boardCanvas.height)
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
                ctxBoard.fillStyle = self.color;
                ctxBoard.strokeStyle = "#FFFFFF";
                if (bit & self.block) {
                    ctxBoard.fillRect(x + size * col + 2, y + size * row + 2, size - 8, size - 8);
                    ctxBoard.strokeRect(x + size * col + 2, y + size * row + 2, size - 4, size - 4);
                }
                col = (col + 1) % 4;
                if (col == 0)
                    ++row;

            }

            if (ghost)
                self.draw_ghost();
        }

        self.draw_ghost = function () {
            ghost_y = 0;
            while (!self.detectCollision(self.x, self.y + ghost_y, self.orientation)) {
                ghost_y += size;
            }
            x = self.x;
            y = self.y + ghost_y - size;
            self.ghostX = x;
            self.ghostY = y;
            col = row = 0;
            for (bit = 0x8000; bit > 0; bit = bit >> 1) {
                //ctxBoard.fillStyle="#AAAAAA";
                ctxBoard.fillStyle = "rgba(0, 0, 0, 0.7)"
                if (bit & self.block) {
                    ctxBoard.fillRect(x + size * col, y + size * row, size, size);

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

                    ctxBoard.clearRect(x + size * col, y + size * row, size, size);
                }

                col = (col + 1) % 4;
                if (col == 0)
                    ++row;

            }
            self.clear_ghost();

        }

        self.clear_ghost = function () {
            col = 0;
            row = 0;
            x = self.ghostX;
            y = self.ghostY;
            for (bit = 0x8000; bit > 0; bit = bit >> 1) {

                if (bit & self.block) {

                    ctxBoard.clearRect(x + size * col, y + size * row, size, size);
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

            self.interval = setInterval(self.goDown, level);

        }

        self.stop = function () {
            clearInterval(self.interval);
            self.clear_ghost();
            self.draw(false);
            col = 0;
            row = 0;
            for (bit = 0x8000; bit > 0; bit = bit >> 1) {

                if (bit & self.block) {

                    boardModel[ixy(self.y + size * row)][ixy(self.x + size * col)][0] = true;
                    boardModel[ixy(self.y + size * row)][ixy(self.x + size * col)][1] = self.color;
                    if (ixy(self.y) == 19) {
                        dis.style.display = "block";
                    }
                }
                col = (col + 1) % 4;
                if (col == 0)
                    ++row;

            }


            checkBoardState();
            nextTetrimino();
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
                self.interval = setInterval(self.goDown, level);
                self.isAccelerating = false;
            }
        }

        self.moveLeft = function () {
            self.dx = -size;
            if (self.detectCollision(self.x + self.dx, self.y, self.orientation)) {
                return 0;
            }

            self.clear();
            self.x += self.dx;
            self.draw();

        }

        self.moveRight = function () {
            self.dx = size;

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
    document.onkeydown = function (e) {
        // w lewo -37, w gore 38, w prawo 39, w dol 40, z 90, x 88
        //	alert(e.keyCode);
        if (e.keyCode == 40) {
            //strzalka w dol
            e.preventDefault();
            currentTetrimino.accelerate();
        }
        else if (e.keyCode == 37) {
            e.preventDefault();
            //strzalka w lewo
            currentTetrimino.moveLeft();
        }
        else if (e.keyCode == 39) {
            e.preventDefault();
            //strzalka w prawo
            currentTetrimino.moveRight();
        }
        else if (e.keyCode == 90 || e.keyCode == 89) {
            e.preventDefault();
            //z
            currentTetrimino.turnCounterClockwise();
        }
        else if (e.keyCode == 88 || e.keyCode == 38) {
            e.preventDefault();
            //x
            currentTetrimino.turnClockWise();
        }
        else if (e.keyCode == 67) {
            e.preventDefault();
            //c
            freeze();
        }






    }

    document.onkeyup = function (e) {


        if (e.keyCode == 40) {
            e.preventDefault();
            //strzalka w dol
            currentTetrimino.slowDown();
        }
        else if (e.keyCode == 32) {
            e.preventDefault();
            //c
            currentTetrimino.drop();
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
            currentTetrimino.turnClockWise();
        else 
            currentTetrimino.turnCounterClockwise();*/

    };

    function handleTouchEnd(evt) {
        x = evt.touches[0].clientX;
        y = evt.touches[0].clientY;
        //alert(evt.touches[0].force);
        half = window.innerWidth / 2;
        alert("x " + x + " xDown" + xDown + " half " + half);
        if (Math.abs(x - xDown2) < 30) {
            if (x > half)
                currentTetrimino.turnClockWise();
            else
                currentTetrimino.turnCounterClockwise();
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
                    currentTetrimino.moveLeft();
            } else {
                /* right swipe */
                for (i = 0; i < -xDiff / 15; ++i)
                    currentTetrimino.moveRight();
            }

        } else {
            if (yDiff > 0) {
                /* up swipe */
                //	currentTetrimino.slowDown();
                currentTetrimino.turnClockWise();
            } else {
                /* down swipe */
                if (currentTetrimino.isAccelerating == false)
                    currentTetrimino.accelerate();
                else
                    currentTetrimino.slowDown();
            }


        }

        xDown = null;
        yDown = null;

    }
}