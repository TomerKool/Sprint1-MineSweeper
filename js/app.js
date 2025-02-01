'use strict'

//TODO fix or remove undo
//TODO maybe onMarkedCell should also start timer and game
//Images
const COVERED_CELL = '🟫'
const MINE = '💣'
const FLAG = '🚩'
const WRONG_FLAG = '❌'
const SMILE = '😊'
const SMILE_WIN = '😎'
const SMILE_LOSE = '😵'
const SMILE_HIT_MINE = '😨'
const EMPTY = '🌫️'
const SAFE_CELL = '😎'



var gBoard
var gLevel = BEGINNER
var gGame
var gIsFirstClick
var gIsLivesMode = true
var gInterval
var gLastClick
var gExpandedCells

// var gBestScoreBeginner
// var gBestScoreMedium
// var gBestScoreExpert

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
    gSafeClickCount = 3
    gExpandedCells = []

    renderBoard(gBoard, '.board-container')
    renderStatus(gGame.lives)
    renderBestScore(gLevel.NAME)
    renderSafeClickCount()

    displayLevel()


    resetHints()
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
    //!remove note if this works at the end of undo creation 
    gLastClick = { i, j }
    console.log(gLastClick);

    checkGameOver()

}

function firstClick(elCell, i, j) {
    //Model:
    gBoard[i][j].isCovered = false
    gGame.coveredCount--
    gLastClick = { i, j }
    console.log(gLastClick);
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
                //DOM:
                var elCurrCell = document.querySelector(`.cell-${i}-${j}`)
                elCurrCell.innerHTML = MINE
            } else if(gBoard[i][j].isMarked) {
                //Model
                gBoard[i][j].isMarked = false
                //DOM
                var elCurrCell = document.querySelector(`.cell-${i}-${j}`)

                elCurrCell.innerHTML = WRONG_FLAG
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

    // gExpandedCells = []`

    for (var i = cellI - 1; i <= cellI + 1; i++) {
        if (i < 0 || i >= board.length) continue
        for (var j = cellJ - 1; j <= cellJ + 1; j++) {
            //Regular neighbors loop checks
            // if (i === cellI && j === cellJ) continue // not skipping the middle cell
            if (j < 0 || j >= board[i].length) continue

            //skip marked cells , and uncovered cells to avoid endless loop of ping pong check between two cells
            if (board[i][j].isMarked) continue
            if (!board[i][j].isCovered) continue
            //execute
            var value = board[i][j].minesAroundCount ? board[i][j].minesAroundCount : EMPTY
            var elCurrCell = document.querySelector(`.cell-${i}-${j}`)
            gExpandedCells.push({ selector: elCurrCell, i, j }) // save all expanded cells in array for undo function

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
        elRestartBtn.innerText = SMILE_WIN
        var newHighScore = saveBestScore()
        if (newHighScore) {
            renderBestScore(gLevel.NAME)
            renderStatus('newHighScore')
        } else {

            renderStatus('win')
        }

    } else {

        elRestartBtn.innerHTML = SMILE_LOSE
        renderStatus('lose')
    }

    clearInterval(gInterval)
}



function onRestart() {
    onInit()
    var elRestartBtn = document.querySelector('.restart-btn')
    elRestartBtn.innerHTML = SMILE

}

/////////////////////////////////////////////////////////////////////////////////
//*LOCAL STORAGE 

function saveBestScore() {
    var level = gLevel.NAME

    if (!localStorage.getItem(`${level}BestScore`)) {
        //No score exist
        localStorage.setItem(`${level}BestScore`, gGame.secsPassed)
        return true
    } else if (localStorage.getItem(`${level}BestScore`) > gGame.secsPassed) {
        //new high score
        console.log(`new best score for ${level} level`);
        localStorage.setItem(`${level}BestScore`, gGame.secsPassed)
        return true
    }


}

function renderBestScore(level) {

    var elBestScore = document.querySelector('.score-board span')
    if (localStorage.getItem(`${level}BestScore`)) {
        elBestScore.innerText = localStorage.getItem(`${level}BestScore`) + ' seconds'
    } else {
        elBestScore.innerText = 'Never been played before'
    }
}
/////////////////////////////////////////////////////////////////////////////////
//*UNDO

function onUndo() {
    if (gIsFirstClick) return

    var loc = gLastClick

    if (gBoard[loc.i][loc.j].isMine) {

    } else if (gBoard[loc.i][loc.j].minesAroundCount) {
        console.log('undo');
        undoCounterClick()

    } else {
        var elCell = document.querySelector(`.cell-${loc.i}-${loc.j}`)
        undoExpandUncover(gBoard, elCell, loc.i, loc.j)
    }

}

function undoCounterClick() {
    var location = gLastClick

    //Model
    gBoard[location.i][location.j].isCovered = true
    gGame.coveredCount++
    //DOM
    renderCell(location, COVERED_CELL)
}

function undoExpandUncover(board) {
    // return
    //TODO FIX function

    for (var i = 0; i < gExpandedCells.length; i++) {
        //Model
        var cellI = gExpandedCells[i].i
        var cellJ = gExpandedCells[i].j
        board[cellI][cellJ].isCovered = true
        gGame.coveredCount++
        //DOM
        var elCurrCell = gExpandedCells[i].selector
        elCurrCell.innerHTML = COVERED_CELL
    }
    //TODO bandage for bug , without this center cell is not undone. fix better
    var loc = gLastClick
    //Model
    board[loc.i][loc.j].isCovered = true
    gGame.coveredCount++
    //DOM
    var elCurrCell = document.querySelector(`.cell-${loc.i}-${loc.j}`)
    elCurrCell.innerHTML = COVERED_CELL

}