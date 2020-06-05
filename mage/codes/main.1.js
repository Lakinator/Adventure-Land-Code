//autorerun

load_code("game_info");
load_code("pot_info");
load_code("game_logic");
load_code("minimap");
load_code("drawing");

game_log("main loaded");

setInterval(() => {

	if (is_disabled(parent.character)) return;

	game_logic.do_logic();

}, 1000 / 2);

// called just before the CODE is destroyed
function on_destroy() {
	clear_drawings();
	clear_buttons();
	ClearMiniMap();
}