extends Node
## Run inside an isolated game checkout. Drive both rulesets through gameplay
## inputs, with a forest checkpoint for the second visit to the same boss.

var game: GameFlow
var world: WorldRoot
var tick := 0
var turns := false

func _process(_delta: float) -> void:
	tick += 1
	if tick > 30000:
		fail("Walkthrough timed out")

func fail(reason: String) -> void:
	printerr(reason)
	get_tree().quit(1)

func mark_chapter(label: String) -> void:
	print("CHAPTER ", tick / 30.0, " ", label)

func wait_seconds(seconds: float) -> void:
	for i in roundi(seconds * 30):
		await get_tree().process_frame

func press(action: String) -> void:
	for down in [true, false]:
		var event := InputEventAction.new()
		event.action = action
		event.pressed = down
		Input.parse_input_event(event)
		Input.flush_buffered_events()
		await get_tree().process_frame

func conversation() -> void:
	while world.dialogue.is_running():
		if world.dialogue.box.is_complete():
			await wait_seconds(1.8)
			await press("confirm")
		else:
			await get_tree().process_frame

func walk(target: Vector2i) -> void:
	var grid := AStarGrid2D.new()
	grid.region = Rect2i(Vector2i.ZERO, world.zone_size)
	grid.diagonal_mode = AStarGrid2D.DIAGONAL_MODE_NEVER
	grid.update()
	var rows := ZoneRules.load_zone(world.zone_id)
	for y in rows.size():
		for x in rows[y].length():
			if not ZoneRules.walkable(rows[y][x]):
				grid.set_point_solid(Vector2i(x,y))
	for solid in world.solids.get_children():
		if not solid is StaticBody2D or not solid.get_child(0).shape is RectangleShape2D:
			continue
		var size: Vector2 = solid.get_child(0).shape.size
		var origin := Vector2i((solid.position - size / 2) / 16)
		for y in roundi(size.y / 16):
			for x in roundi(size.x / 16):
				grid.set_point_solid(origin + Vector2i(x,y))
	var start := MapMonster.cell_of(Vector2i(world.body.position))
	grid.set_point_solid(start, false)
	grid.set_point_solid(target, false)
	var path := grid.get_id_path(start, target)
	if path.is_empty():
		fail("No route to " + str(target))
		return
	Input.action_press("run")
	for cell in path.slice(1):
		var goal := WorldRoot.feet_of(cell)
		for i in 55:
			if game.action != null or game.screen != null or not world.body.input_enabled:
				Input.action_release("run")
				return
			var diff := goal - Vector2i(world.body.position)
			if diff.abs().x <= 2 and diff.abs().y <= 2:
				break
			var key := ("move_right" if diff.x > 0 else "move_left") if absi(diff.x) > 2 else ("move_down" if diff.y > 0 else "move_up")
			Input.action_press(key)
			await get_tree().physics_frame
			Input.action_release(key)
			if i == 54:
				fail("Blocked at %s heading to %s" % [world.body.position,goal])
				return
	Input.action_release("run")

func _ready() -> void:
	turns = "--turns" in OS.get_cmdline_user_args()
	game = load("res://scenes/game.tscn").instantiate()
	if turns:
		game.show_title = false
		game.play_opening = false
		game.action_combat = false
		game.start_zone = "ashen_forest"
		game.start_cell = Vector2i(74,31)
	add_child(game)
	world = game.world
	await wait_seconds(2)
	if not turns:
		mark_chapter("New game")
		await press("confirm")
		await wait_seconds(1)
		await conversation()
		mark_chapter("Valdehoja")
		await walk(Vector2i(86,22))
		Input.action_press("move_up")
		await get_tree().physics_frame
		Input.action_release("move_up")
		await press("confirm")
		await conversation()
		await walk(Vector2i(89,33))
		Input.action_press("move_right")
		await wait_seconds(0.5)
		Input.action_release("move_right")
		await wait_seconds(1)
		mark_chapter("The forest")
		await conversation()
	if world.zone_id != "ashen_forest":
		fail("Forest entrance was not reached")
		return
	var target := world.monster.cell
	mark_chapter("Approach the flame")
	await walk(target)
	for attempt in 8:
		if game.screen != null or game.action != null or not world.body.input_enabled:
			break
		var delta := world.monster.position - world.body.position
		var key := ("move_down" if delta.y > 0 else "move_up") if absf(delta.y) > absf(delta.x) else ("move_right" if delta.x > 0 else "move_left")
		Input.action_press(key)
		await wait_seconds(0.4)
		Input.action_release(key)
	for i in 180:
		if game.screen != null or game.action != null:
			break
		await get_tree().process_frame
	if turns:
		if game.screen == null:
			fail("Turn encounter did not start")
			return
		mark_chapter("Turn-based battle")
		var ordered := false
		while game.result == -1:
			await wait_seconds(0.8)
			if game.screen._phase == BattleScreen.Phase.CHOOSING:
				mark_chapter("Round %d" % game.screen._round)
			if game.result != -1:
				break
			if game.screen._phase == BattleScreen.Phase.CHOOSING and not ordered:
				await press("order")
				ordered = true
				await wait_seconds(2)
			await press("confirm")
		mark_chapter("Battle result")
		await wait_seconds(3)
		await press("confirm")
	else:
		if game.action == null:
			fail("Action encounter did not start")
			return
		mark_chapter("Action battle")
		await wait_seconds(1)
		await press("attack")
		await wait_seconds(1.1)
		await press("hero_next")
		await wait_seconds(1)
		for i in 18:
			if not game.action or not game.action.running:
				break
			var delta := game.action.monster_feet() - game.action.hero_feet()
			var key := ("move_down" if delta.y > 0 else "move_up") if absf(delta.y) > absf(delta.x) else ("move_right" if delta.x > 0 else "move_left")
			Input.action_press(key)
			await get_tree().physics_frame
			Input.action_release(key)
			await press("eco")
			await wait_seconds(0.42)
	for i in 300:
		if world.dialogue.is_running():
			break
		await get_tree().process_frame
	if not GameState.is_zone_purified("ashen_forest"):
		fail("The boss was not purified")
		return
	mark_chapter("The forest recovers")
	await conversation()
	if not turns:
		await walk(Vector2i(75,45))
		Input.action_press("move_down")
		await wait_seconds(0.5)
		Input.action_release("move_down")
		mark_chapter("End of the demo")
		if world.dialogue.conversation != "demo_fin":
			fail("Ending dialogue was not reached")
			return
		await conversation()
	await wait_seconds(3)
	mark_chapter("End")
	get_tree().quit()
