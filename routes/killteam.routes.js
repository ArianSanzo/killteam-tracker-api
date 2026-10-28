import { Router } from 'express';

import { User } from '../src/models/User.js';
import { Operative } from '../src/models/Operative.js';
import { Weapon } from '../src/models/Weapon.js';
import { Match } from '../src/models/Match.js';
import { Rule } from '../src/models/Rule.js';
import { Ability } from '../src/models/Ability.js';

const router = Router();

router.get("/users", async (req, res) => {
    const users = await User.findAll();
    res.json(users);
});
router.post("/users", async (req, res) => {
    const { name, email, password, roleId } = req.body;
    const newUser = await User.create({
        name,
        email,
        password,
        roleId
    });
    res.json(newUser);
});
router.get("/users/:id", async (req, res) => {
    const { id } = req.params;
    const user = await User.findByPk(id);
    res.json(user);
});
router.put("/users/:id", async (req, res) => {
    const { id } = req.params;
    const { name, email, password, roleId } = req.body;

    const user = await User.findByPk(id);

    await user.update({
        name,
        email,
        password,
        roleId
    });

    await user.save();

    res.json(user);
});
router.delete("/users/:id", async (req, res) => {
    const { id } = req.params;

    const user = await User.findByPk(id);
    
    await user.destroy();

    res.send(`Eliminando usuario ${id}`)
});


router.get("/operatives", async (req, res) => {
    const operatives = await Operative.findAll();
    res.json(operatives);
});
router.post("/operatives", async (req, res) => {
    const { name, wounds, movement, apl, save, img, teamId } = req.body;
    const newOperative = await Operative.create({
        name,
        wounds,
        movement,
        apl,
        save,
        img,
        teamId
    });
    res.json(newOperative);
});
router.get("/operatives/:id", async (req, res) => {
    const { id } = req.params;
    const operative = await Operative.findByPk(id);
    res.json(operative);
});
router.put("/operatives/:id", async (req, res) => {
    const { id } = req.params;
    const { name, wounds, movement, apl, save, img, teamId } = req.body;

    const operative = await Operative.findByPk(id);

    await operative.update({
        name,
        wounds,
        movement,
        apl,
        save,
        img,
        teamId
    });

    await operative.save();

    res.json(operative);

});
router.delete("/operatives/:id", async (req, res) => {
    const { id } = req.params;

    const operative = await Operative.findByPk(id);

    await operative.destroy();

    res.send(`Eliminando operativo ${id}`)
});

router.get("/weapons", async (req, res) => {
    const weapons = await Weapon.findAll();
    res.json(weapons);
});
router.post("/weapons", async (req, res) => {
    const { name, attack, hit, damage, range } = req.body;
    const newWeapon = await Weapon.create({
        name,
        attack,
        hit,
        damage,
        range
    });
    res.json(newWeapon);
});
router.get("/weapons/:id", async (req, res) => {
    const { id } = req.params;
    const weapon = await Weapon.findByPk(id);
    res.json(weapon);
});
router.put("/weapons/:id", async (req, res) => {
    const { id } = req.params;

    const weapon = await Weapon.findByPk(id);

    await weapon.update({
        name,
        attack,
        hit,
        damage,
        range
    });

    await weapon.save();

    res.json(weapon)
});
router.delete("/weapons/:id", async (req, res) => {
    const { id } = req.params;

    const weapon = await Weapon.findByPk(id);

    await weapon.destroy();

    res.send(`Eliminando arma ${id}`)
});

router.get("/matchs", async (req, res) => {
    const matchs = await Match.findAll();
    res.json(matchs);
});
router.post("/matchs", async (req, res) => {
    const { name, date, userId } = req.body;
    const newMatch = await Match.create({
        name,
        date,
        userId
    });
    res.json(newMatch);
});
router.get("/matchs/:id", async (req, res) => {
    const { id } = req.params;
    const match = await Match.findByPk(id);
    res.json(match);
});
router.put("/matchs/:id", async (req, res) => {
    const { id } = req.params;

    const match = await Match.findByPk(id);

    await match.update({
        name,
        date,
        userId
    });

    await match.save();

    res.json(match);
});
router.delete("/matchs/:id", async (req, res) => {
    const { id } = req.params;

    const match = await Match.findByPk(id);

    await match.destroy();

    res.send(`Eliminando partida ${id}`)
});

router.get("/rules", async (req, res) => {
    const rules = await Rule.findAll();
    res.json(rules);
});
router.post("/rules", async (req, res) => {
    const { name, description } = req.body;
    const newRule = await Rule.create({
        name,
        description
    });
    res.json(newRule);
});
router.get("/rules/:id", async (req, res) => {
    const { id } = req.params;
    const rule = await Rule.findByPk(id);
    res.json(rule);
});
router.put("/rules/:id", async (req, res) => {
    const { id } = req.params;

    const rule = await Rule.findByPk(id);

    await rule.update({
        name,
        description
    });

    await rule.save();

    res.json(rule);
});
router.delete("/rules/:id", async (req, res) => {
    const { id } = req.params;
    const rule = await Rule.findByPk(id);

    await rule.destroy();

    res.send(`Eliminando efecto ${id} de armas`)
});


router.get("/abilities", async (req, res) => {
    const abilities = await Ability.findAll();
    res.json(abilities);
});
router.post("/abilities", async (req, res) => {
    const { name, description } = req.body;
    const newAbility = await Ability.create({
        name,
        description
    });
    res.json(newAbility);
});
router.get("/abilities/:id", async (req, res) => {
    const { id } = req.params;
    const ability = await Ability.findByPk(id);
    res.json(ability);
});
router.put("/abilities/:id", async (req, res) => {
    const { id } = req.params;

    const ability = await Ability.findByPk(id);

    await ability.update({
        name,
        description
    });

    await ability.save();

    res.json(ability);
});
router.delete("/abilities/:id", async (req, res) => {
    const { id } = req.params;
    const ability = await Ability.findByPk(id);

    await ability.destroy();
    
    res.send(`Eliminando habilidad ${id}`)
});

export default router;