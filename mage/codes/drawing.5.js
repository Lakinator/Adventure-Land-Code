//gets called once every frame
function on_draw() {
    clear_drawings();

    //call minimap
    minimap_draw();

    //range + safespace
    draw_circle(parent.character.real_x, parent.character.real_y, parent.character.range, 1, null);
    draw_circle(parent.character.real_x, parent.character.real_y, game_info.get_safe_dist(), 1, game_info.is_safe() ? 0x61cf89 : 0xeb2d46);

    //enemies in range
    let monsters_in_range = game_info.get_monsters_in_range();
    for (let i = 0; i < monsters_in_range.length; i++) {
        draw_circle(monsters_in_range[i].x, monsters_in_range[i].y, monsters_in_range[i].range, 1, null);
    }

    //target
    let target = get_target();
    if (target) draw_circle(target.x, target.y, target.range, 1, 0x0911ef);

    //moving
    draw_circle(game_logic.get_next_pos().x, game_logic.get_next_pos().y, 5, 1, 0xffcc00);

    //debug draw
    let move_line = { p1: { x: get_x(parent.character), y: get_y(parent.character) }, p2: { x: game_logic.get_next_pos().x, y: game_logic.get_next_pos().y } };
    draw_line(move_line.p1.x, move_line.p1.y, move_line.p2.x, move_line.p2.y, 2, 0x28fc03);

    game_logic.get_nearby_lines().forEach((line) => {
        draw_line(line.p1.x, line.p1.y, line.p2.x, line.p2.y, 2, null);
    });

    game_logic.get_intersecting_lines().forEach((intersection) => {
        draw_line(intersection.line.p1.x, intersection.line.p1.y, intersection.line.p2.x, intersection.line.p2.y, 2, 0xfc0303);
        draw_circle(intersection.point.x, intersection.point.y, 3, 1, 0x0314fc);
    });
}

/* // based on distance function
function get_real_pos(entity) {
    let _pos = get_xy(entity);
    return {
        bl: {
            x: _pos[0] - (get_width(entity) / 2),
            y: _pos[1] - (get_height(entity) / 2)
        },
        br: {
            x: _pos[0] + (get_width(entity) / 2),
            y: _pos[1] - (get_height(entity) / 2)
        },
        tl: {
            x: _pos[0],
            y: _pos[1]
        },
        tr: {
            x: _pos[0],
            y: _pos[1] - get_height(entity)
        }
    };
} */

function draw_borders() {
    var map_data = get_map().data;
    for (id in map_data.x_lines) {
        var line = map_data.x_lines[id];

        var x1 = line[0];
        var y1 = line[1];
        var x2 = line[0];
        var y2 = line[2];

        //draw_line(x1, y1, x2, y2, 2, null);
    }

    for (id in map_data.y_lines) {
        var line = map_data.y_lines[id];

        var x1 = line[1];
        var y1 = line[0];
        var x2 = line[2];
        var y2 = line[0];

        //draw_line(x1, y1, x2, y2, 2, null);
    }
}