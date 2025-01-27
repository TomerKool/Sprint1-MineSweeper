'use strict'
//Images
const COVERED_CELL = '🪟'
const MINE = '💣'
const FLAG = '🚩'
const SMILE = '😊'
const SMILE_WIN = '😎'
const SMILE_LOSE = '😵'
const EMPTY = '🌫️'


var gBoard
var gLevel
var gGame
var gIsFirstClick

/////////////////////////////////////////////////////////////////////////////////

function onInit() {
    gLevel = { SIZE: 4, MINES: 2 }
    gGame = {
        isOn: false,
        coveredCount: 0,
        markedCount: 0,
        secsPassed: 0
    }
    gBoard = buildBoard()
    gIsFirstClick = true

    renderBoard(gBoard, '.board-container')
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
    return board
}


function setMines(board) {

    const size = gLevel.SIZE
    const minesCount = gLevel.MINES

    const minesLocs = getRandomMineLocs(size, minesCount)
    var currIdx = 0

    for (var i = 0; i < board.length; i++) {
        for (var j = 0; j < board[i].length; j++) {
            if (!board[i][j].isCovered) continue
            board[i][j].isMine = (minesLocs.includes(currIdx)) ? true : false
            currIdx++
        }
    }
}

function getRandomMineLocs(size, mines) {
    var idx = 0
    var arr = []
    for (var i = 0; i < size; i++) {
        for (var j = 0; j < size; j++) {
            if (!gBoard[i][j].isCovered) continue
            arr.push(idx)
            idx++
        }
    }
    var minesArr = []
    for (var i = 0; i < mines; i++) {
        var randIdx = getRandomInt(0, arr.length)
        minesArr.push(arr.splice(randIdx, 1)[0])
    }
    console.log(minesArr);
    return minesArr
}

function setMinesNegsCount(board) {
    for (var i = 0; i < board.length; i++) {
        for (var j = 0; j < board[i].length; j++) {
            board[i][j].minesAroundCount = countNeighbors(board, i, j)
        }
    }
}

function renderBoard(mat, selector) {

    var strHTML = '<table><tbody>'
    for (var i = 0; i < mat.length; i++) {

        strHTML += '<tr>'
        for (var j = 0; j < mat[0].length; j++) {
            //check under the hood
            //const cell = mat[i][j].isMine ? MINE : mat[i][j].minesAroundCount
            const cell = COVERED_CELL
            const className = `cell cell-${i}-${j}`

            strHTML += `<td oncontextmenu="onCellMarked(this, event,${i} , ${j} )"
            onclick="onCellClicked(this, ${i} , ${j})" 
            class="${className}">${cell}</td>`
        }
        strHTML += '</tr>'
    }
    strHTML += '</tbody></table>'

    const elContainer = document.querySelector(selector)
    elContainer.innerHTML = strHTML

}

/////////////////////////////////////////////////////////////////////////////////
//USER ACTIONS

function onCellClicked(elCell, i, j) {
    if (gIsFirstClick) {
        //Model:
        gBoard[i][j].isCovered = false
        gGame.coveredCount--
        //DOM:
        elCell.innerHTML = EMPTY
        gIsFirstClick = false
        setMines(gBoard)
        setMinesNegsCount(gBoard)
        return
    }

    if (gBoard[i][j].isMarked) return

    if (gBoard[i][j].isMine) {//*HIT MINE
        unCoverMines()
    } else if (gBoard[i][j].minesAroundCount) {//*HIT NUMBER
        uncoverCell(elCell, gBoard[i][j].minesAroundCount, i, j)
    } else {//*HIT EMPTY
        expandUncover(gBoard, elCell, i, j)
    }

    checkGameOver()

}

function onCellMarked(elCell, ev, i, j) {
    handleContextMenu(ev)
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
    uncoverCell(elCell, EMPTY, cellI, cellJ)
    if (board[cellI][cellJ].minesAroundCount) return

    for (var i = cellI - 1; i <= cellI + 1; i++) {
        if (i < 0 || i >= board.length) continue
        for (var j = cellJ - 1; j <= cellJ + 1; j++) {
            //Regular neighbors loop checks
            if (i === cellI && j === cellJ) continue
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
    if (!gGame.coveredCount > 0) return false
    for (var i = 0; i < gBoard.length; i++) {
        for (var j = 0; j < gBoard[i].length; j++) {
            if (gBoard[i][j].Mine && !gBoard[i][j].isMarked) return false
        }
    }
    return endGame()
    //!continue here, from some resean it passes the first term.
    //!Also resolve another issue where the count decreases too much.
}

function endGame() {
    console.log('game over');
}



function onRestart() {
    onInit()
}

