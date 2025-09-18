kaplay();

loadBean();

scene("game", () => {
	debug.log("entered to game scene");

	const obj = add([
		sprite("bean")
	]);

	scene.onKeyPress("s", () => {
		debug.log("this gonna work just in game scene");
	});

	app.onKeyPress("a", () => {
		debug.log("this gonna work for ever.");
	});

	obj.onKeyPress("d", () => {
		debug.log("this gonna work while the object exists.");
	});

	onKeyPress("f", () => {
		debug.log("bye");
		go("gameover");
	});
});

scene("gameover", (params) => {
	debug.log("entered to gameover scene");
});

go("game");
