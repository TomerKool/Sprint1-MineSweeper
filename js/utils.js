'use strict'


var gStartTime

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

function getRandomInt(min, max) {
    const minCeiled = Math.ceil(min);
    const maxFloored = Math.floor(max);
    return Math.floor(Math.random() * (maxFloored - minCeiled) + minCeiled);
}

function countNeighbors(mat, cellI, cellJ) {
    var negsCount = 0

    for (var i = cellI - 1; i <= cellI + 1; i++) {
        if (i < 0 || i >= mat.length) continue
        for (var j = cellJ - 1; j <= cellJ + 1; j++) {
            if (i === cellI && j === cellJ) continue
            if (j < 0 || j >= mat[i].length) continue
            if (mat[i][j].isMine) negsCount++
        }
    }
    return negsCount
}

function handleContextMenu(event) {
    event.preventDefault();
}

function renderCell(location, value) {
    // Select the elCell and set the value
    const elCell = document.querySelector(`.cell-${location.i}-${location.j}`)
    elCell.innerHTML = value
}

function startTimer() {
    gStartTime = Date.now()
    gInterval = setInterval(updateTime, 1)
}

function updateTime() {
    var currTime = Date.now()
    var elapsedTime = currTime - gStartTime
    
    var min = Math.floor(elapsedTime / (1000 * 60) % 60)
    var sec = Math.floor(elapsedTime / 1000 % 60)
    var milSec = Math.floor(elapsedTime % 1000)

    gGame.secsPassed = min * 60 + sec + milSec / 1000

    var elTime = document.querySelector('.timer')
    elTime.innerHTML = `${min} : ${sec} : ${milSec}`
}

function resetTimer() {
    clearInterval(gInterval)

    gGame.secsPassed = 0

    var elTimer = document.querySelector('.timer')
    elTimer.innerHTML = '0 : 0 : 000'
    gStartTime = 0
    gInterval = null
}


// function checkZone(fromI, fromJ, toI, toJ, target, value) {
//     for (var i = fromI; i <= toI; i++) {
//         for (var j = fromJ; j <= toJ; j++) {
//             if (target === value) return true
//         }
//     }
//     return false
// }
