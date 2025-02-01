'use strict'
//LEVELS
const BEGINNER = { NAME: 'beginner', SIZE: 4, MINES: 2 }
const MEDIUM = { NAME: 'medium', SIZE: 8, MINES: 14 }
const EXPERT = { NAME: 'expert', SIZE: 12, MINES: 32 }

//*LIVES MODE
function renderStatus(status) {

    switch (status) {
        case 0:
            var statusDisplay = 'No Mercy'
            break
        case 1:
            var statusDisplay = '❤️'
            break
        case 2:
            var statusDisplay = '❤️❤️'
            break
        case 3:
            var statusDisplay = '❤️❤️❤️'
            break
        case 'win':
            var statusDisplay = 'WIN'
            break
        case 'lose':
            var statusDisplay = 'LOSE'
            break
            case 'newHighScore':
                var statusDisplay = 'NEW BEST SCORE!'
                
            break
        default:
            var statusDisplay = ''
    }
    var elLiveCounter = document.querySelector('.live-counter')
    elLiveCounter.innerHTML = statusDisplay
}

function onLivesMode(elLivesBtn) {
    if (!gIsFirstClick) return
    gIsLivesMode = !gIsLivesMode
    gGame.lives = gIsLivesMode ? 3 : 0

    var lives = gIsLivesMode ? 3 : 0
    console.log(elLivesBtn);
    elLivesBtn.style.backgroundColor = gIsLivesMode ? 'red' : 'white'
    console.log('hiii', lives);
    renderStatus(lives)

}

function reduceLives() {
    var elRestartBtn = document.querySelector('.restart-btn')
    elRestartBtn.innerHTML = SMILE_HIT_MINE

    setTimeout(() => {
        if (gGame.isOn) elRestartBtn.innerHTML = SMILE
    }, 2000);
    gGame.lives--
    renderStatus(gGame.lives)
}

/////////////////////////////////////////////////////////////////////////////////
//*PICK LEVEL
//TODO (nice to have) Make beginner mode light up on refresh 
function onClickLevel(levelNum) {
    if (!gIsFirstClick) return

    switch (levelNum) {
        case 0:
            // var size = +prompt('choose size:')
            // var mineCount = +prompt('Mines number:')
            gLevel = { SIZE: 2, MINES: 1 }
            break
        case 1:
            gLevel = BEGINNER
            break
        case 2:
            gLevel = MEDIUM
            break
        case 3:
            gLevel = EXPERT
            break
        default:
            gLevel = BEGINNER
            break
    }

    displayLevel()

    onInit()
}

function displayLevel() {
    var levelNum = getLevelNum()
    for (var i = 0; i < 4; i++) {
        var elCurrLevel = document.querySelector(`.level${i}`)
        if (i === levelNum) {
            elCurrLevel.classList.add('level-on')
            continue
        }
        elCurrLevel.classList.remove('level-on')
    }
    renderBestScore(gLevel.NAME)
    //todo add support for best score per level
}

function getLevelNum() {
    var levelNum
    switch (gLevel) {
        case BEGINNER:
            levelNum = 1
            break
        case MEDIUM:

            levelNum = 2
            break
        case EXPERT:
            levelNum = 3
            
            break
            case CUSTOMIZED:
            levelNum = 0
            break
        default:
            gLevel = BEGINNER
            break
    }

    return levelNum
}


