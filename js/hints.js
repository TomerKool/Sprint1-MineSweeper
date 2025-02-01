'use strict'


var gIsHintMode
var gSafeClickCount
/////////////////////////////////////////////////////////////////////////////////
//*SIMPLE HINTS
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
            elCurrHintBtnX.hidden = true
        }
    }
    gIsHintMode = false
}

function resetHints() {
    for (var i = 0; i < 3; i++) {
        var elCurrHintBtnX = document.querySelector(`.hint-btn${i + 1}`)
        console.log(elCurrHintBtnX);
        if(elCurrHintBtnX.hidden) elCurrHintBtnX.hidden = false
    }
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
            if (board[i][j].isMarked) {
                renderCell(location, FLAG)
            } else {
                renderCell(location, COVERED_CELL)
            }
        }
    }
}

/////////////////////////////////////////////////////////////////////////////////
//*SAFE CLICK

function onSafeClick() {
    if (!gSafeClickCount) return
    if (!gGame.isOn) return
    var safeCellLoc = getSafeCellLoc()


    renderCell(safeCellLoc, SAFE_CELL)
    gGame.isOn = false
    gSafeClickCount--
    renderSafeClickCount()

    setTimeout(() => {
        renderCell(safeCellLoc, COVERED_CELL)
        gGame.isOn = true
    }, 1500);

}

function getSafeCellLoc() {

    var safeCellsLocs = []
    for (var i = 0; i < gBoard.length; i++) {
        for (var j = 0; j < gBoard[i].length; j++) {
            var currCell = gBoard[i][j]
            if (!currCell.isMine && currCell.isCovered) safeCellsLocs.push({ i, j })
        }
    }
    console.log(safeCellLoc);

    var safeCellLoc = safeCellsLocs[getRandomInt(0, safeCellsLocs.length - 1)]
    return safeCellLoc

}

function renderSafeClickCount() {
    var elSafeClickCount = document.querySelector('.safeclick-count')
    elSafeClickCount.innerText = gSafeClickCount
}