'use strict'


var gIsHintMode

function onClickHint(elHintBtn) {
    // prevent clicking on two hints
    for (var i = 0; i < 3; i++) {
        var elCurrHintBtnX = document.querySelector(`.hint-btn${i + 1}`)
        if (elHintBtn === elCurrHintBtnX) continue
        if (elCurrHintBtnX.classList.contains('hint-on')) return
    }
    gIsHintMode = !gIsHintMode
    elHintBtn.classList.toggle('hint-on')
}

function removeUsedClick() {
    for (var i = 0; i < 3; i++) {
        var elCurrHintBtnX = document.querySelector(`.hint-btn${i + 1}`)
        if (elCurrHintBtnX.classList.contains('hint-on')) {
            elCurrHintBtnX.classList.remove('hint-on')
            elCurrHintBtnX.hidden = 'true'
        }
    }
    gIsHintMode = false
}



function showCells(board, cellI, cellJ) {
    for (var i = cellI - 1; i <= cellI + 1; i++) {
        if (i < 0 || i >= board.length) continue
        for (var j = cellJ - 1; j <= cellJ + 1; j++) {
            //Regular neighbors loop checks
            if (j < 0 || j >= board[i].length) continue
            //Skip covered cells
            if (!board[i][j].isCovered) continue
            //execute
            if (board[i][j].isMine) {
                var value = MINE
            } else if (board[i][j].minesAroundCount) {
                var value = board[i][j].minesAroundCount
            } else {
                var value = EMPTY
            }
            // var elCurrCell = document.querySelector(`.cell-${i}-${j}`)
            var location = { i, j }
            renderCell(location, value)
        }
    }


}

function hideCells(board, cellI, cellJ) {
    for (var i = cellI - 1; i <= cellI + 1; i++) {
        if (i < 0 || i >= board.length) continue
        for (var j = cellJ - 1; j <= cellJ + 1; j++) {
            //Regular neighbors loop checks
            if (j < 0 || j >= board[i].length) continue
            //Skip covered cells
            if (!board[i][j].isCovered) continue
            //execute
            var location = { i, j }
            renderCell(location, COVERED_CELL)
        }
    }
}