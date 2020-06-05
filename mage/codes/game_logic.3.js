var game_logic = (() => {
    let next_pos = { x: character.x, y: character.y };
    let nearby_lines = [];
    let intersecting_lines = [];

    function do_logic() {
        loot();
        game_info.update();
        item_info.use_potions();

        let monster = get_target();
        if (monster != null) {
            if (!is_in_range(monster, "attack")) {
                if (!is_moving(parent.character)) {
                    //TODO take intersections into consideration
                    let newX = get_x(parent.character) + (monster.x - get_x(parent.character)) / 2;
                    let newY = get_y(parent.character) + (monster.y - get_y(parent.character)) / 2;
                    better_move(newX, newY, null);
                }
            } else if (!is_on_cooldown("attack")) {
                attack(monster);
            }

            //move away from enemy if too close
            if (!is_moving(parent.character)) {
                if (!game_info.is_safe()) {
                    game_log("Moving away from " + monster.mtype);

                    move_away_from(monster);
                }
            }

        } else {
            //no nearby monster, maybe smart_move to current selected attack mtype?
        }
    }

    function move_away_from(entity) {
        //calculate movement away from entity
        let x_diff = game_info.get_safe_dist() - Math.abs(get_x(parent.character) - get_x(entity)) + (entity.range * 2);
        let y_diff = game_info.get_safe_dist() - Math.abs(get_y(parent.character) - get_y(entity)) + (entity.range * 2);

        let x_mult = Math.abs(y_diff / x_diff);
        let y_mult = Math.abs(x_diff / y_diff);

        x_diff *= y_mult;
        y_diff *= x_mult;

        if (get_x(parent.character) < entity.x) x_diff *= -1;
        if (get_y(parent.character) < entity.y) y_diff *= -1;

        let newX = get_x(parent.character) + x_diff;
        let newY = get_y(parent.character) + y_diff;

        //check for line intersection
        update_lines();
        intersecting_lines = [];
        let move_line = {
            p1: { x: get_x(parent.character), y: get_y(parent.character) },
            p2: { x: newX, y: newY }
        };

        nearby_lines.forEach((line) => {
            let inter = line_intersects(move_line.p1, move_line.p2, line.p1, line.p2);

            if (inter.intersects) {

                if (inter.p.x >= (line.p1.x < line.p2.x ? line.p1.x : line.p2.x) &&
                    inter.p.x <= (line.p1.x > line.p2.x ? line.p1.x : line.p2.x) &&
                    inter.p.y >= (line.p1.y < line.p2.y ? line.p1.y : line.p2.y) &&
                    inter.p.x <= (line.p1.y > line.p2.y ? line.p1.y : line.p2.y)) {
                    intersecting_lines.push({
                        line: line,
                        point: inter.p
                    });
                }

            }
        });

        //TODO better move away if wall is in the way
        if (intersecting_lines.length > 0) {
            game_log("Wall in the way", "#fc6f03");
            newX = get_x(parent.character) - x_diff;
            newY = get_y(parent.character) - y_diff;
        }

        better_move(newX, newY, () => { game_log("Moving away failed!", "#fc0303"); });
    }

    function update_lines() {
        let map_data = get_map().data;
        nearby_lines = [];

        //vertical lines
        for (id in map_data.x_lines) {
            let line = map_data.x_lines[id];

            let x1 = line[0];
            let y1 = line[1];
            let x2 = line[0];
            let y2 = line[2];

            let offset = parent.character.range;

            if ((x1 >= get_x(parent.character) - offset && x1 <= get_x(parent.character) + offset)) {

                if ((y1 >= get_y(parent.character) - offset && y1 <= get_y(parent.character) + offset) ||
                    (y2 >= get_y(parent.character) - offset && y2 <= get_y(parent.character) + offset)) {
                    nearby_lines.push({
                        p1: { x: x1, y: y1 },
                        p2: { x: x2, y: y2 }
                    });
                }

            }
        }

        //horizontal lines
        for (id in map_data.y_lines) {
            let line = map_data.y_lines[id];

            let x1 = line[1];
            let y1 = line[0];
            let x2 = line[2];
            let y2 = line[0];

            let offset = parent.character.range;

            if ((y1 >= get_y(parent.character) - offset && y1 <= get_y(parent.character) + offset)) {

                if ((x1 >= get_x(parent.character) - offset && x1 <= get_x(parent.character) + offset) ||
                    (x2 >= get_x(parent.character) - offset && x2 <= get_x(parent.character) + offset)) {
                    nearby_lines.push({
                        p1: { x: x1, y: y1 },
                        p2: { x: x2, y: y2 }
                    });
                }
            }
        }
    }

    function line_intersects(p1, p2, p3, p4) {
        let det, gamma, lambda;
        det = (p2.x - p1.x) * (p4.y - p3.y) - (p4.x - p3.x) * (p2.y - p1.y);
        if (det === 0) {
            return {
                intersects: false
            };
        } else {
            lambda = ((p4.y - p3.y) * (p4.x - p1.x) + (p3.x - p4.x) * (p4.y - p1.y)) / det;
            gamma = ((p1.y - p2.y) * (p4.x - p1.x) + (p2.x - p1.x) * (p4.y - p1.y)) / det;
            return {
                intersects: (0 < lambda && lambda < 1) && (0 < gamma && gamma < 1),
                p: {
                    x: p1.x + lambda * (p2.x - p1.x),
                    y: p1.y + lambda * (p2.y - p1.y)
                }
            };
        }
    };

    function better_move(x, y, on_error) {
        next_pos.x = x;
        next_pos.y = y;

        if (can_move_to(x, y) && can_walk(parent.character)) {
            parent.move(x, y);
        } else {
            if (on_error) on_error();
        }
    }

    /* function line_at(p1, p2, f) {
        // p1 + f * (strecke  p1 p2)
        return {
            x: p1.x + f * (p1.x - p2.x),
            y: p1.y + f * (p1.y - p2.y)
        }
    } */

    return {
        do_logic: do_logic,
        line_intersects: line_intersects,
        get_next_pos: () => { return next_pos },
        get_nearby_lines: () => { return nearby_lines },
        get_intersecting_lines: () => { return intersecting_lines }
    };
})();