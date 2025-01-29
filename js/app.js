'use strict'
//Images
const COVERED_CELL = '🪟'
const MINE = '💣'
const FLAG = '🚩'
const SMILE = '😊'
const SMILE_WIN = '😎'
const SMILE_LOSE = '😵'
const SMILE_HIT_MINE = '😨'
const EMPTY = '🌫️'


var gBoard
var gLevel = { SIZE: 4, MINES: 2 }
var gGame
var gIsFirstClick
var gIsLivesMode = true
var gInterval

/////////////////////////////////////////////////////////////////////////////////

function onInit() {

    gGame = {
        isOn: true,
        coveredCount: 0,
        markedCount: 0,
        secsPassed: 0,
        lives: gIsLivesMode ? 3 : 0
    }
    gBoard = buildBoard()
    gIsFirstClick = true
    gIsHintMode = false

    renderBoard(gBoard, '.board-container')
    renderLiveCount(gGame.lives)


    resetTimer()

}



function buildBoard() {
    const size = gLevel.SIZE
    const board = []

    for (var i = 0; i < size; i++) {
        board.push([])
        for (var j = 0; j < size; j++) {
            board[i][j] = {
                minesAroundCount: 0,
                isCovered: true,
                isMine: false,
                isMarked: false
            }

            gGame.coveredCount++

        }
    }
    // console.log(gGame.coveredCount);
    return board
}

/////////////////////////////////////////////////////////////////////////////////
//*MINES DEPLOYMENT
function setMines(board, firstClickedCellLoc) {

    const size = gLevel.SIZE
    const minesCount = gLevel.MINES

    const minesLocs = getRandomMineLocs(size, minesCount, firstClickedCellLoc)
    var currIdx = 0
    // console.log('firstClickedCellLoc:' , firstClickedCellLoc);
    // console.log('minesLocs:' , minesLocs);
    // console.log(board.length**2);
    for (var i = 0; i < board.length; i++) {
        for (var j = 0; j < board[i].length; j++) {
            // console.log('currIdx:', currIdx);
            if (!board[i][j].isCovered) {
                currIdx++
                continue
            }
            board[i][j].isMine = (minesLocs.includes(currIdx)) ? true : false
            // console.log(`board[${i}][${j}].isMine` , board[i][j].isMine);
            currIdx++
        }
    }
}

function getRandomMineLocs(size, minesCount, firstClickedCellLoc) {
    var loc = firstClickedCellLoc
    var idx = 0
    var arr = []
    for (var i = 0; i < size; i++) {
        for (var j = 0; j < size; j++) {
            if ((i >= loc.i - 1 && i <= loc.i + 1) && // if term to skip first cell and surrounding 
                (j >= loc.j - 1 && j <= loc.j + 1)) {
                idx++
                continue
            }
            arr.push(idx)
            idx++
        }
    }
    // console.log(arr);
    var minesArr = []
    for (var i = 0; i < minesCount; i++) {
        var randIdx = getRandomInt(0, arr.length)
        minesArr.push(arr.splice(randIdx, 1)[0])
    }
    return minesArr
}

function setMinesNegsCount(board) {
    for (var i = 0; i < board.length; i++) {
        for (var j = 0; j < board[i].length; j++) {
            board[i][j].minesAroundCount = countNeighbors(board, i, j)
        }
    }
}



/////////////////////////////////////////////////////////////////////////////////
//*USER ACTIONS

function onCellClicked(elCell, i, j) {
    if (!gGame.isOn) return
    console.log('gGame.coveredCount: ', gGame.coveredCount);
    if (gIsHintMode) {
        showCells(gBoard, i, j)
        gGame.isOn = false // prevent from playing while hint is shown

        setTimeout(() => {
            hideCells(gBoard, i, j)
            gGame.isOn = true // return to play mode
            removeUsedClick()

        }, 1500);
        return
    }

    if (gIsFirstClick) return firstClick(elCell, i, j)
    if (gBoard[i][j].isMarked) return

    if (gBoard[i][j].isMine) {//*HIT MINE
        if (gIsLivesMode && gGame.lives > 1) {
            reduceLives()
        } else {
            unCoverMines()
            endGame(false)
        }
    } else if (gBoard[i][j].minesAroundCount) {//*HIT NUMBER
        uncoverCell(elCell, gBoard[i][j].minesAroundCount, i, j)
    } else {//*HIT EMPTY
        expandUncover(gBoard, elCell, i, j)
    }

    checkGameOver()

}

function firstClick(elCell, i, j) {
    //Model:
    gBoard[i][j].isCovered = false
    gGame.coveredCount--
    //DOM:
    elCell.innerHTML = EMPTY
    gIsFirstClick = false
    setMines(gBoard, { i, j })
    setMinesNegsCount(gBoard)
    expandUncover(gBoard, elCell, i, j)
    startTimer()
    // console.log(gGame.coveredCount);

}

function onCellMarked(elCell, ev, i, j) {
    handleContextMenu(ev)
    if (!gGame.isOn) return
    if (!gBoard[i][j].isCovered) return

    if (gBoard[i][j].isMarked) {
        //Model:
        gBoard[i][j].isMarked = false
        //DOM: 
        elCell.innerHTML = COVERED_CELL

    } else {
        //Model:
        gBoard[i][j].isMarked = true
        //DOM: 
        elCell.innerHTML = FLAG

    }

    checkGameOver()
}

/////////////////////////////////////////////////////////////////////////////////
function unCoverMines() {
    for (var i = 0; i < gBoard.length; i++) {
        for (var j = 0; j < gBoard[i].length; j++) {
            if (gBoard[i][j].isMine) {
                //Model:
                gBoard[i][j].isCovered = false
                gGame.coveredCount--
                //Model:
                var elCurrCell = document.querySelector(`.cell-${i}-${j}`)
                elCurrCell.innerHTML = MINE
            }
        }
    }
}

function uncoverCell(selector, value, cellI, cellJ) {
    //Model:
    gBoard[cellI][cellJ].isCovered = false
    gGame.coveredCount--
    //DOM: 
    selector.innerHTML = value
}

function expandUncover(board, elCell, cellI, cellJ) {
    if (board[cellI][cellJ].minesAroundCount) return

    for (var i = cellI - 1; i <= cellI + 1; i++) {
        if (i < 0 || i >= board.length) continue
        for (var j = cellJ - 1; j <= cellJ + 1; j++) {
            //Regular neighbors loop checks
            if (i === cellI && j === cellJ) continue // not skipping the middle cell
            if (j < 0 || j >= board[i].length) continue

            //skip marked cells , and uncovered cells to avoid endless loop of ping pong check between two cells
            if (board[i][j].isMarked) continue
            if (!board[i][j].isCovered) continue
            //execute
            var value = board[i][j].minesAroundCount ? board[i][j].minesAroundCount : EMPTY
            var elCurrCell = document.querySelector(`.cell-${i}-${j}`)
            uncoverCell(elCurrCell, value, i, j)
            if (value === EMPTY) expandUncover(board, elCurrCell, i, j)
        }
    }
}


function checkGameOver() {
    console.log(gGame.coveredCount);
    if (gGame.coveredCount - gLevel.MINES > 0) return false
    for (var i = 0; i < gBoard.length; i++) {
        for (var j = 0; j < gBoard[i].length; j++) {
            if (gBoard[i][j].isMine && !gBoard[i][j].isMarked) return false
        }
    }
    return endGame(true)

}

function endGame(isWin) {

    gGame.isOn = false
    var elRestartBtn = document.querySelector('.restart-btn')

    if (isWin) {
        console.log('WIN');

        elRestartBtn.innerText = SMILE_WIN

    } else {
        console.log('LOSE');

        elRestartBtn.innerHTML = SMILE_LOSE
        renderLiveCount()
    }

    clearInterval(gInterval)
}



function onRestart() {
    onInit()
    var elRestartBtn = document.querySelector('.restart-btn')
    elRestartBtn.innerHTML = SMILE

}

/////////////////////////////////////////////////////////////////////////////////
//*LIVES MODE
function renderLiveCount(liveCount) {

    switch (liveCount) {
        case 0:
            var liveDisplay = 'No Mercy'
            break
        case 1:
            var liveDisplay = '❤️'
            break
        case 2:
            var liveDisplay = '❤️❤️'
            break
        case 3:
            var liveDisplay = '❤️❤️❤️'
            break
        default:
            var liveDisplay = ''
    }
    var elLiveCounter = document.querySelector('.live-counter')
    elLiveCounter.innerHTML = liveDisplay
}

function onLivesMode(elLivesBtn) {
    if (!gIsFirstClick) return
    gIsLivesMode = !gIsLivesMode
    gGame.lives = gIsLivesMode ? 3 : 0

    var lives = gIsLivesMode ? 3 : 0
    console.log(elLivesBtn);
    elLivesBtn.style.backgroundColor = gIsLivesMode ? 'red' : 'white'
    console.log('hiii', lives);
    renderLiveCount(lives)

}

function reduceLives() {
    var elRestartBtn = document.querySelector('.restart-btn')
    elRestartBtn.innerHTML = SMILE_HIT_MINE

    setTimeout(() => {
        if (gGame.isOn) elRestartBtn.innerHTML = SMILE
    }, 2000);
    gGame.lives--
    renderLiveCount(gGame.lives)
}

/////////////////////////////////////////////////////////////////////////////////
//*PICK LEVEL
//TODO Make beginner mode light up on refresh 
function onChangeLevel(elLevel, level) {
    if (!gIsFirstClick) return

    switch (level) {
        case 0:
            // var size = +prompt('choose size:')
            // var mineCount = +prompt('Mines number:')
            gLevel = { SIZE: 2, MINES: 1 }
            break
        case 1:
            gLevel = { SIZE: 4, MINES: 2 }
            break
        case 2:
            gLevel = { SIZE: 8, MINES: 14 }
            break
        case 3:
            gLevel = { SIZE: 12, MINES: 32 }
            break
        default:
            gLevel = { SIZE: 4, MINES: 2 }
            break
    }

    displayLevel(level)

    onInit()
}

function displayLevel(level) {
    for (var i = 0; i < 4; i++) {
        var elCurrLevel = document.querySelector(`.level${i}`)
        if (i === level) {
            elCurrLevel.classList.add('level-on')
            continue
        }
        elCurrLevel.classList.remove('level-on')
    }
}
