document.addEventListener('DOMContentLoaded', () => {
	const grid = document.querySelector('.grid')
	let squares = Array.from(document.querySelectorAll('.grid div'))
	const scoreDisplay = document.querySelector('#score')
	const startBtn = document.querySelector('#start-button')
	const keyConfig = document.querySelector('#key-config')
	const modalBg = document.querySelector('.modal-bg')
	const modalClose = document.querySelector('.modal-close')
	const submitBtn = document.querySelector('#submit-keys')
	const width = 10
	let nextRandom = null
	let timerId
	let score = 0
	let heldPiece
	let holdReady = true
	let maxTime = 1
	let timer = maxTime
	let upcomingArray = []
	//KeyBindings
	let moveLeftKey = 37
	let moveRightKey = 39
	let rotateLeftKey = 88
	let rotateRightKey = 38
	let softDownKey = 40
	let holdKey = 90
	let hardDownKey = 32
	let oldKeys = {"left":37,"right":39,"soft":40,"hard":32,"rleft":88,"rright":38,"hold":90}
	let tempKeys = oldKeys
	let oldKeyNames = {}

	let sevenBag = [0,1,2,3,4,5,6]
	const colors = [
		'blue',
		'lime',
		'purple',
		'yellow',
		'cyan',
		'red',
		'orange'
	]


	//Shapes
	const JPiece = [
		[0, width, width+1, width+2],
		[1, width+1, width*2+1, 2],
		[width, width+1, width+2, width*2+2],
		[1, width+1, width*2+1, width*2]
	]

	const SPiece = [
		[width+1, width+2, width*2, width*2+1],
		[0, width, width+1, width*2+1],
		[width+1, width+2, width*2, width*2+1],
		[0, width, width+1, width*2+1]
	]

	const TPiece = [
		[1, width, width+1, width+2],
		[1, width+1, width+2, width*2+1],
		[width, width+1, width+2, width*2+1],
		[1, width, width+1, width*2+1]
	]

	const SquarePiece = [
		[0, 1, width, width+1],
		[0, 1, width, width+1],
		[0, 1, width, width+1],
		[0, 1, width, width+1]
	]

	const LongPiece = [
		[width, width+1, width+2, width+3],
		[1, width+1, width*2+1, width*3+1],
		[width, width+1, width+2, width+3],
		[1, width+1, width*2+1, width*3+1]

	]

	const ZPiece = [
		[width, width+1, width*2+1, width*2+2],
		[1, width, width+1, width*2],
		[width, width+1, width*2+1, width*2+2],
		[1, width, width+1, width*2]
	]

	const LPiece = [
		[2, width, width+1, width+2],
		[1, width+1, width*2+1, width*2+2],
		[width, width+1, width+2, width*2],
		[0, 1, width+1, width*2+1]

	]
	
	const pieces = [JPiece, SPiece, TPiece, SquarePiece, LongPiece, ZPiece, LPiece]

	let currentPosition = 4
	let currentRotation = 0
	let random = Math.floor(Math.random()*sevenBag.length)
	let current = pieces[sevenBag[random]][currentRotation]
	sevenBag.splice(random,1)
	let ghostPosition = currentPosition


	/*
	function to draw tetromino piece
	*/
	function draw() {
		ghostPosition = currentPosition
		while(!current.some(index => squares[ghostPosition + index + width].classList.contains('taken'))) {
			ghostPosition += width
		}
		current.forEach(index => {
			squares[ghostPosition + index].classList.add('ghost')
			squares[ghostPosition + index].style.backgroundColor = colors[random]
			//squares[ghostPosition + index].style.backgroundColor = colors[random]
		})
		current.forEach(index => {
			squares[currentPosition + index].classList.remove('ghost')
			squares[currentPosition + index].classList.add('tetromino')
			squares[currentPosition + index].style.backgroundColor = colors[random]
		})
	}

	/*
	function to erase current tetromino piece
	*/
	function undraw() {
		current.forEach(index => {
			squares[currentPosition + index].classList.remove('tetromino')
			squares[currentPosition + index].style.backgroundColor = ''
		})
		current.forEach(index => {
			squares[ghostPosition + index].classList.remove('ghost')
			squares[ghostPosition + index].style.backgroundColor = ''
		})
	}

	/*
	Shifts the location of current piece one row down
	This function is to be automated by the game and not used by the player
	Timer is used to countdown how long the piece can be touching the floor before being locked into place
	*/
	function moveDown(){
		freeze()
		undraw()
		if (timer == maxTime) {
			currentPosition += width
		}
		draw()
	}

	/*
	Shifts the location of current piece one row down
	This function is to be used by the player
	Timer is used to countdown how long the piece can be touching the floor before being locked into place
	*/
	function softDown(){
		undraw()
		if (timer == maxTime && !current.some(index => squares[currentPosition + index + width].classList.contains('taken'))) {
			currentPosition += width
		}
		draw()
	}

	//timerId = setInterval(moveDown, 500)

	/*
	key controls
	*/
	function control(e) {
		if (e.keyCode == moveLeftKey) {
			moveLeft()
		}
		if (e.keyCode == moveRightKey) {
			moveRight()
		}
		if (e.keyCode == rotateLeftKey) {
			rotateLeft()
		}
		if (e.keyCode == rotateRightKey) {
			rotateRight()
		}
		if (e.keyCode == softDownKey) {
			softDown()
		}
		if (e.keyCode == holdKey) {
			hold()
		}
		if (e.keyCode == hardDownKey) {
			hardDown()
		}
		
	}

	/*
	this function places a new random piece into the queue
	*/
	function queueNext() {
		if(sevenBag.length == 0) {
			sevenBag = [0,1,2,3,4,5,6]
		}
		nextRandom = Math.floor(Math.random() * sevenBag.length)
		for (var i = 0; i < 5; i++) {
			if (i != 4) {
				upcomingArray[i] = upcomingArray[i+1]
			}
			else {
				upcomingArray[i] = sevenBag[nextRandom]
			}
		}
		sevenBag.splice(nextRandom,1)
	}

	/*
	This function does a check to see if the piece should be locked into place.
	If a spot under the current piece is taken, then it will decrement the timer. (to allow player to rotate before the piece is locked)
	If a spot under is taken and the timer has run out, then the piece will be locked into place.
	Else the timer will reset.
	*/
	function freeze() {
		if (timer == 0 && current.some(index => squares[currentPosition + index + width].classList.contains('taken'))) {
			current.forEach(index => squares[currentPosition + index].classList.add('taken'))
			random = upcomingArray[0]
			queueNext()
			current = pieces[random][0]
			currentPosition = 4
			currentRotation = 0
			holdReady = true
			displayShape()
			addScore()
			draw()
			gameOver()
		}
		else if(current.some(index => squares[currentPosition + index + width].classList.contains('taken'))) {
			timer -= 1
		}
		else {
			timer = maxTime
		}
	}

	/*
	move piece left unless at the edge or there is another piece
	*/
	function moveLeft() {
		undraw()
		const isAtLeftEdge = current.some(index => (currentPosition + index) % width === 0)

		if(!isAtLeftEdge) currentPosition -= 1

		if(current.some(index => squares[currentPosition + index].classList.contains('taken'))) {
			currentPosition += 1
		}
		draw()
	}

	/*
	move piece right unless at the edge or there is another piece
	*/
	function moveRight() {
		undraw()
		const isAtRightEdge = current.some(index => (currentPosition + index) % width === width - 1)

		if(!isAtRightEdge) currentPosition += 1

		if(current.some(index => squares[currentPosition + index].classList.contains('taken'))) {
			currentPosition -= 1
		}
		draw()
	}

	function hardDown() {
		undraw()
		while (!current.some(index => squares[currentPosition + index + width].classList.contains('taken'))) {
			currentPosition += width
		}
		draw()
		timer = 0
		freeze()
	}

	//check if there is a wall to the left or at left edge
	function wallLeft() {
		return ((current.some(index => (currentPosition + index) % width === 0)) || (current.some(index => squares[currentPosition + index - 1].classList.contains('taken'))))
	}

	//check if there is a wall to the right or at right edge
	function wallRight() {
		return (current.some(index => (currentPosition + index) % width === width - 1)) || ((current.some(index => squares[currentPosition + index + 1].classList.contains('taken'))))
	}

	//check if at left edge
	function edgeLeft() {
		return current.some(index => (currentPosition + index) % width === 0)
	}

	//check if at right edge
	function edgeRight() {
		return current.some(index => (currentPosition + index) % width === width - 1)
	}

	/*
	rotate to the right unless:
	rotating results in part of block going past edge
	results in overlapping with another block
	If there is space:
	when overlapping to the right or going pass right edge, move left
	when overlapping to the left or going pass left edge, move right
	when overlapping down or going into floor, move up
	*/
	function rotateRight() {
		undraw()
		const wallAtLeft = wallLeft()
		const wallAtRight = wallRight()

		oldRotation = currentRotation
		currentRotation++
		if(currentRotation === current.length) {
			currentRotation = 0
		}
		current = pieces[random][currentRotation]


		const isAtLeftEdge = current.some(index => (currentPosition + index) % width === 0)
		const isAtRightEdge = current.some(index => (currentPosition + index) % width === width - 1)
		function outOfBoundLeft() {
			return ((wallAtLeft && (edgeLeft() && edgeRight())) || ((current.some(index => squares[currentPosition + index].classList.contains('taken'))) && !wallAtRight))
		}
		function outOfBoundRight() {
			return ((wallAtRight && (edgeLeft() && edgeRight())) || ((current.some(index => squares[currentPosition + index].classList.contains('taken'))) && !wallAtLeft))
		}
		if (!current.some(index => squares[currentPosition + index].classList.contains('taken')) && !(current.some(index => (currentPosition + index) % width === 0) && current.some(index => (currentPosition + index) % width === width - 1))) {

		}
		else if (current.some(index => squares[currentPosition + index].classList.contains('taken')) && !(current.some(index => (currentPosition + index) % width === 0) && current.some(index => (currentPosition + index) % width === width - 1))) {
			if (!current.some(index => squares[currentPosition + index - width].classList.contains('taken'))) {
				currentPosition -= width
			}
			else if (!current.some(index => squares[currentPosition + index - width*2].classList.contains('taken'))) {
				currentPosition -= width*2
			}
			else {
				currentRotation = oldRotation
			}
		}
		else if (current.some(index => squares[currentPosition + index].classList.contains('taken')) && !wallAtRight && !wallAtLeft) {
			if (!current.some(index => squares[currentPosition + index - 1].classList.contains('taken'))) {
				currentPosition--
			}
			else {
				currentRotation = oldRotation
			}
		}
		else if (!wallAtRight && !wallAtLeft && wallLeft() && wallRight()) {
			currentPosition--
			if ((current.some(index => squares[currentPosition + index].classList.contains('taken'))) || (wallLeft() && wallRight())) {
				currentPosition++
				currentRotation = oldRotation
			}
		}
		else if (outOfBoundLeft() && outOfBoundRight()) {
			currentRotation = oldRotation
		}
		else if (outOfBoundLeft() || outOfBoundRight()) {
			while (outOfBoundLeft()) {
				currentPosition++
			}

			while (outOfBoundRight()) {
				currentPosition--
			}
		}


		current = pieces[random][currentRotation]
		draw()
	}

	/*
	rotate to the left unless:
	rotating results in part of block going past edge
	results in overlapping with another block
	If there is space:
	when overlapping to the right or going pass right edge, move left
	when overlapping to the left or going pass left edge, move right
	when overlapping down or going into floor, move up
	*/
	function rotateLeft() {
		undraw()
		const wallAtLeft = wallLeft()
		const wallAtRight = wallRight()

		oldRotation = currentRotation
		currentRotation--
		if(currentRotation < 0) {
			currentRotation = current.length-1
		}
		current = pieces[random][currentRotation]


		const isAtLeftEdge = current.some(index => (currentPosition + index) % width === 0)
		const isAtRightEdge = current.some(index => (currentPosition + index) % width === width - 1)
		function outOfBoundLeft() {
			return ((wallAtLeft && (edgeLeft() && edgeRight())) || ((current.some(index => squares[currentPosition + index].classList.contains('taken'))) && !wallAtRight))
		}
		function outOfBoundRight() {
			return ((wallAtRight && (edgeLeft() && edgeRight())) || ((current.some(index => squares[currentPosition + index].classList.contains('taken'))) && !wallAtLeft))
		}
		if (!current.some(index => squares[currentPosition + index].classList.contains('taken')) && !(current.some(index => (currentPosition + index) % width === 0) && current.some(index => (currentPosition + index) % width === width - 1))) {

		}
		else if (current.some(index => squares[currentPosition + index].classList.contains('taken')) && !(current.some(index => (currentPosition + index) % width === 0) && current.some(index => (currentPosition + index) % width === width - 1))) {
			if (!current.some(index => squares[currentPosition + index - width].classList.contains('taken'))) {
				currentPosition -= width
			}
			else if (!current.some(index => squares[currentPosition + index - width*2].classList.contains('taken'))) {
				currentPosition -= width*2
			}
			else {
				currentRotation = oldRotation
			}
		}
		else if (current.some(index => squares[currentPosition + index].classList.contains('taken')) && !wallAtRight && !wallAtLeft) {
			if (!current.some(index => squares[currentPosition + index - 1].classList.contains('taken'))) {
				currentPosition--
			}
			else {
				currentRotation = oldRotation
			}
		}
		else if (!wallAtRight && !wallAtLeft && wallLeft() && wallRight()) {
			currentPosition--
			if ((current.some(index => squares[currentPosition + index].classList.contains('taken'))) || (wallLeft() && wallRight())) {
				currentPosition++
				currentRotation = oldRotation
			}
		}
		else if (outOfBoundLeft() && outOfBoundRight()) {
			currentRotation = oldRotation
		}
		else if (outOfBoundLeft() || outOfBoundRight()) {
			while (outOfBoundLeft()) {
				currentPosition++
			}

			while (outOfBoundRight()) {
				currentPosition--
			}
		}
		
		current = pieces[random][currentRotation]
		draw()
	}

	const heldSquares = document.querySelectorAll('.held-grid div')
	const heldWidth = 4
	let heldIndex = 0

	/*
	function will reserve the current piece to be used later and continues queue
	if already holding a piece, then will swap current piece with held piece
	*/
	function hold() {
		if(heldPiece == null) {
			undraw()
			heldPiece = random
			displayHold()
			random = upcomingArray[0]
			queueNext()
			current = pieces[random][0]
			currentRotation = 0
			currentPosition = 4
			holdReady = false
			draw()
			displayShape()
		}
		else if (holdReady) {
			undraw()
			let tempHeld = random
			random = heldPiece
			heldPiece = tempHeld
			displayHold()
			current = pieces[random][0]
			currentPosition = 4
			currentRotation = 0
			holdReady = false
			draw()
		}

	}

	//display currently held piece in held grid
	function displayHold() {
		heldSquares.forEach(square => {
			square.classList.remove('tetromino')
			square.style.backgroundColor = ''
		})
		nextPieces[heldPiece].forEach(index => {
			heldSquares[displayIndex + index].classList.add('tetromino')
			heldSquares[displayIndex + index].style.backgroundColor = colors[heldPiece]
		})
	}



	//up-next display
	const displaySquares = document.querySelectorAll('.mini-grid div')
	const displayWidth = 4
	let displayIndex = 0

	const nextPieces = [
		[0, displayWidth, displayWidth+1, displayWidth+2],
		[displayWidth+1, displayWidth+2, displayWidth*2, displayWidth*2+1],
		[1, displayWidth, displayWidth+1, displayWidth+2],
		[0, 1, displayWidth, displayWidth+1],
		[displayWidth, displayWidth+1, displayWidth+2, displayWidth+3],
		[displayWidth, displayWidth+1, displayWidth*2+1, displayWidth*2+2],
		[2, displayWidth, displayWidth+1, displayWidth+2]
	]

	const displayQueueSquares = document.querySelectorAll('.upcoming-grid div')
	const displayQueueWidth = 4
	let displayQueueIndex = 0

	//display the next 5 upcoming pieces
	function displayShape() {
		displaySquares.forEach(square => {
			square.classList.remove('tetromino')
			square.style.backgroundColor = ''
		})
		nextPieces[upcomingArray[0]].forEach(index => {
			displaySquares[displayIndex + index].classList.add('tetromino')
			displaySquares[displayIndex + index].style.backgroundColor = colors[upcomingArray[0]]
		})
		displayQueueSquares.forEach(square => {
			square.classList.remove('tetromino')
			square.style.backgroundColor = ''
		})
		for (var i = 1; i < 5; i++) {
			nextPieces[upcomingArray[i]].forEach(index => {
				displayQueueSquares[displayIndex + index + (i-1)*16].classList.add('tetromino')
				displayQueueSquares[displayIndex + index + (i-1)*16].style.backgroundColor = colors[upcomingArray[i]]
			})
		}
	}

	//start the game, if game is already running then pause, if paused the resume
	startBtn.addEventListener('click', () => {
		if (timerId) {
			clearInterval(timerId)
			timerId = null
			document.removeEventListener('keydown',control)
		} 
		else {
			draw()
			document.addEventListener('keydown',control)
			timerId = setInterval(moveDown, 500)
			if (nextRandom == null) {
				for (var i = 0; i < 5; i++) {
					nextRandom = Math.floor(Math.random() * sevenBag.length)
					upcomingArray.push(sevenBag[nextRandom])
					sevenBag.splice(nextRandom,1)
				}
				
			}
			displayShape()
		}
		startBtn.blur()
	})

	/*
	If any row is now complete, then erase row and add to score
	then move all blocks above row down
	*/
	function addScore() {
		for (let i = 0; i < 199; i += width) {
			const row = [i, i+1, i+2, i+3, i+4, i+5, i+6, i+7, i+8, i+9]

			if(row.every(index => squares[index].classList.contains('taken'))) {
				score += 10
				scoreDisplay.innerHTML = score
				row.forEach(index => {
					squares[index].classList.remove('taken')
					squares[index].classList.remove('tetromino')
					squares[index].style.backgroundColor = ''
				})
				const squaresRemoved = squares.splice(i, width)
				squares = squaresRemoved.concat(squares)
				squares.forEach(cell => grid.appendChild(cell))
			}
		}
	}

	//if newly created piece overlaps with placed piece, the the game is over
	function gameOver() {
		if(current.some(index => squares[currentPosition + index].classList.contains('taken'))) {
			scoreDisplay.innerHTML = 'end'
			clearInterval(timerId)
			document.removeEventListener('keydown',control)
		}
	}

	keyConfig.addEventListener('click', () => {
		modalBg.classList.add('bg-active')
	})

	modalClose.addEventListener('click', () => {
		moveLeftKey = oldKeys["left"]
		moveRightKey = oldKeys["right"]
		rotateLeftKey = oldKeys["rleft"]
		rotateRightKey = oldKeys["rright"]
		softDownKey = oldKeys["soft"]
		holdKey = oldKeys["hold"]
		hardDownKey = oldKeys["hard"]
		modalBg.classList.remove('bg-active')
		document.querySelectorAll('.keybind').forEach(item => {
			item.value = oldKeyNames[item.name]
		})
	})

	document.querySelectorAll('.keybind').forEach(item => {
		oldKeyNames[item.name] = item.value
		item.addEventListener('keydown', e => {
			if (e.keyCode == 32) {
				item.value = "Spacebar"
			}
			else {
				item.value = e.key
			}
			tempKeys[item.name] = e.keyCode

		})
	})

	const moveLeftInput = document.querySelector('#MLeft-input')
	const moveRightInput = document.querySelector('#MRight-input')
	const rotateLeftInput = document.querySelector('#RLeft-input')
	const rotateRightInput = document.querySelector('#RRight-input')
	const softDownInput = document.querySelector('#soft-input')
	const hardDownInput = document.querySelector('#hard-input')
	const holdInput = document.querySelector('#hold-input')

	submitBtn.addEventListener('click', () => {
		moveLeftKey = tempKeys["left"]
		moveRightKey = tempKeys["right"]
		rotateLeftKey = tempKeys["rleft"]
		rotateRightKey = tempKeys["rright"]
		softDownKey = tempKeys["soft"]
		holdKey = tempKeys["hold"]
		hardDownKey = tempKeys["hard"]
		oldKeys = tempKeys
		document.querySelectorAll('.keybind').forEach(item => {
			oldKeyNames[item.name] = item.value
		})
		modalBg.classList.remove('bg-active')
	})
})