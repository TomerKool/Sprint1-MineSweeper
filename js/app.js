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


/////////////////////////////////////////////////////////////////////////////////

function onInit() {
    gLevel = { SIZE: 4, MINES: 2 }
    gBoard = buildBoard()
    gGame = {
        isOn: false,
        coveredCount: 0,
        markedCount: 0,
        secsPassed: 0
    }

    setMinesNegsCount(gBoard)

    renderBoard(gBoard, '.board-container')
}

function buildBoard() {
    const size = gLevel.SIZE
    const minesCount = gLevel.MINES
    const board = []

    const minesLocs = getRandomMineLocs(size, minesCount)
    var currIdx = 0

    for (var i = 0; i < size; i++) {
        board.push([])
        for (var j = 0; j < size; j++) {
            board[i][j] = {
                minesAroundCount: 0,
                isCovered: true,
                isMine: (minesLocs.includes(currIdx)) ? true : false,
                isMarked: false
            }
            currIdx++
        }
    }

    return board
}

function getRandomMineLocs(size, mines) {
    var arrSize = size ** 2
    var arr = []
    for (var i = 0; i < arrSize; i++) {
        arr.push(i)
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

function onCellClicked(elCell, i, j) {
    if(gBoard[i][j].isMarked) return
    //Model:
    gBoard[i][j].isCovered = false

    //DOM: 
    elCell.innerHTML = uncoverCell(i, j)
}

function uncoverCell(i, j) {
    if (gBoard[i][j].isMine) {
        return MINE
    } else if (gBoard[i][j].minesAroundCount) {
        return gBoard[i][j].minesAroundCount
    } else {
        return EMPTY
    }
}

function onCellMarked(elCell, ev , i, j) {
    if(!gBoard[i][j].isCovered) return

    handleContextMenu(ev)
    if(gBoard[i][j].isMarked){
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
}

function checkGameOver() {

}

function expandUncover(board, elCell, i, j) {

}

function onRestart() {
    onInit()
}

