var game_info = (() => {
    let safe_dist = 10;
    let safe = true;
    let attack_mtype = "crab"; //goo, bee, crab
    let monsters_in_range = [];

    function update() {
        update_monsters_in_range();
        update_safe(get_nearest_monster());
        update_target();
    }

    /* // useless because of simple_distance
    function real_distance(a, b) {
        if (!a || !b) return 0;
        let a_xy = get_xy(a);
        let b_xy = get_xy(b);

        let x = Math.abs(a_xy[0] - b_xy[0]);
        let y = Math.abs(a_xy[1] - b_xy[1]);

        return Math.floor(Math.sqrt(x * x + y * y));
    } */

    function update_target() {
        let monster = get_nearest_monster({ type: attack_mtype });
        let target = get_target();

        if (monster && target) {
            let target_of_monster = get_target_of(monster);
            if (monster.id != target.id && (target_of_monster == null || target_of_monster.id == parent.character.id)) change_target(monster);
        } else if (monster && !target) {
            change_target(monster);
        }
    }

    function update_monsters_in_range() {
        let range = parent.character.range;

        let arr = [];
        for (id in parent.entities) {
            let current = parent.entities[id];
            if (current.type != "monster" || current.dead) continue;
            if (attack_mtype != null)
                if (attack_mtype != current.mtype) continue;
            let c_dist = simple_distance(character, current);
            //game_log("c_dist: " + c_dist + " | range: " + range);
            if (c_dist < range) arr.push(current);
        }

        monsters_in_range = arr;
    }

    function update_safe(monster) {
        safe_dist = monster.range + 10;
        let dist = simple_distance(character, monster) - monster.range - safe_dist;
        safe = dist > 0;
    }

    return {
        update: update,
        is_safe: () => { return safe },
        get_safe_dist: () => { return safe_dist },
        get_attack_mtype: () => { return attack_mtype },
        get_monsters_in_range: () => { return monsters_in_range }
    };

})();