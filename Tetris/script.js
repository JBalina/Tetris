document.addEventListener('DOMContentLoaded', () => {
	const grid = document.querySelector('.grid')
	let squares = Array.from(document.querySelectorAll('.grid div'))
	const scoreDisplay = document.querySelector('#score')
	const startBtn = document.querySelector('#start-button')
	const width = 10
	let nextRandom = null
	let timerId
	let score = 0
	let heldPiece
	let holdReady = true
	let maxTime = 1
	let timer = maxTime
	let upcomingArray = []
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
	let random = Math.floor(Math.random()*pieces.length)
	let current = pieces[random][currentRotation]
	let ghostPosition = currentPosition

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

	function moveDown(){
		freeze()
		undraw()
		if (timer == maxTime) {
			currentPosition += width
		}
		draw()
	}

	function softDown(){
		undraw()
		if (timer == maxTime && !current.some(index => squares[currentPosition + index + width].classList.contains('taken'))) {
			currentPosition += width
		}
		draw()
	}

	//timerId = setInterval(moveDown, 500)

	function control(e) {
		if (e.keyCode === 37) {
			moveLeft()
		}
		if (e.keyCode == 39) {
			moveRight()
		}
		if (e.keyCode == 88) {
			rotateLeft()
		}
		if (e.keyCode == 38) {
			rotateRight()
		}
		if (e.keyCode == 40) {
			softDown()
		}
		if (e.keyCode == 90) {
			hold()
		}
		if (e.keyCode == 32) {
			hardDown()
		}
		
	}

	function queueNext() {
		nextRandom = Math.floor(Math.random() * pieces.length)
			for (var i = 0; i < 5; i++) {
				if (i != 4) {
					upcomingArray[i] = upcomingArray[i+1]
				}
				else {
					upcomingArray[i] = nextRandom
				}
			}
	}

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

	function moveLeft() {
		undraw()
		const isAtLeftEdge = current.some(index => (currentPosition + index) % width === 0)

		if(!isAtLeftEdge) currentPosition -= 1

		if(current.some(index => squares[currentPosition + index].classList.contains('taken'))) {
			currentPosition += 1
		}
		draw()
	}

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


	function wallLeft() {
		return ((current.some(index => (currentPosition + index) % width === 0)) || (current.some(index => squares[currentPosition + index - 1].classList.contains('taken'))))
	}

	function wallRight() {
		return (current.some(index => (currentPosition + index) % width === width - 1)) || ((current.some(index => squares[currentPosition + index + 1].classList.contains('taken'))))
	}

	function edgeLeft() {
		return current.some(index => (currentPosition + index) % width === 0)
	}

	function edgeRight() {
		return current.some(index => (currentPosition + index) % width === width - 1)
	}

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
					nextRandom = Math.floor(Math.random() * pieces.length)
					upcomingArray.push(nextRandom)
				}
				
			}
			displayShape()
		}
		startBtn.blur()
	})

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

	function gameOver() {
		if(current.some(index => squares[currentPosition + index].classList.contains('taken'))) {
			scoreDisplay.innerHTML = 'end'
			clearInterval(timerId)
			document.removeEventListener('keydown',control)
		}
	}
})