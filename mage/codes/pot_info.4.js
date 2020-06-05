var item_info = (() => {
    let pot_info = {};

    //TODO buy potions when empty

    function use_potions() {
        if (safeties && mssince(last_potion) < min(200, character.ping * 3)) return;

        let used = false;

        let missingHP = parent.character.max_hp - parent.character.hp;
        let missingMP = parent.character.max_mp - parent.character.mp;

        //hp
        Object.keys(pot_info.hp).forEach((key) => {
            if (missingHP >= pot_info.hp[key].gives && pot_info.hp[key].q > 0 && !used) {
                if (new Date() >= parent.next_skill.use_hp) {
                    use(pot_info.hp[key].inv_id);
                    used = true;
                    game_log("Healed " + pot_info.hp[key].gives + " hp");
                }
            }
        });

        //mp
        Object.keys(pot_info.mp).forEach((key) => {
            if (missingMP >= pot_info.mp[key].gives && pot_info.mp[key].q > 0 && !used) {
                if (new Date() >= parent.next_skill.use_mp) {
                    use(pot_info.mp[key].inv_id);
                    used = true;
                    game_log("Restored " + pot_info.mp[key].gives + " mp");
                }
            }
        });


        if (used) {
            last_potion = new Date();
            update_item_count();
        }
    }

    function update_item_count() {
        pot_info = {
            hp: {
                hpot0: {
                    q: 0,
                    gives: parent.G.items.hpot0.gives[0][1],
                    inv_id: -1
                },
                hpot1: {
                    q: 0,
                    gives: parent.G.items.hpot1.gives[0][1],
                    inv_id: -1
                },
                hpotx: {
                    q: 0,
                    gives: parent.G.items.hpotx.gives[0][1],
                    inv_id: -1
                }
            },
            mp: {
                mpot0: {
                    q: 0,
                    gives: parent.G.items.mpot0.gives[0][1],
                    inv_id: -1
                },
                mpot1: {
                    q: 0,
                    gives: parent.G.items.mpot1.gives[0][1],
                    inv_id: -1
                },
                mpotx: {
                    q: 0,
                    gives: parent.G.items.mpotx.gives[0][1],
                    inv_id: -1
                }
            }
        };

        parent.character.items.forEach((item, index) => {
            if (item) {
                if (item.name in pot_info.hp) {
                    pot_info.hp[item.name].q = item.q;
                    pot_info.hp[item.name].inv_id = index;
                } else if (item.name in pot_info.mp) {
                    pot_info.mp[item.name].q = item.q;
                    pot_info.mp[item.name].inv_id = index;
                }
            }
        });
    }

    update_item_count();

    return {
        use_potions: use_potions,
        get_pot_info: () => { return pot_info }
    };
})();