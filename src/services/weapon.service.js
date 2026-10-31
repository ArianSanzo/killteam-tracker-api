import { Weapon } from "../models/Weapon";

export const createWeapon = async (req, res) => {
    const { name, attack, hit, damage, range } = req.body;
    if (!name || !attack || !hit || !damage || !range){
        res.status(400).send({ message: "Campos name, attack, hit, damage y range requeridos" })
    }
    const newWeapon = await Weapon.create({
        name,
        attack,
        hit,
        damage,
        range
    });
    res.json(newWeapon);
};

export const updateWeapon = async (req, res) => {
    const { id } = req.params;
    const { name, attack, hit, damage, range } = req.body;
    if (!name || !attack || !hit || !damage || !range){
        res.status(400).send({ message: "Campos name, attack, hit, damage y range requeridos" })
    }
    const weapon = await Weapon.findByPk(id);
    if (!weapon){
        res.status(404).send({ message: "Arma no encontrada" })
    }
    await weapon.update({
        name,
        attack,
        hit,
        damage,
        range
    });

    await weapon.save();

    res.json(weapon)
};

export const deleteWeapon = async (req, res) => {
    const { id } = req.params;

    const weapon = await Weapon.findByPk(id);
    if (!weapon){
        res.status(404).send({ message: "Arma no encontrada" })
    }
    await weapon.destroy();

    res.send(`Eliminando arma ${id}`)
};

export const findWeapons = async (req, res) => {
    const weapons = await Weapon.findAll();
    res.json(weapons);
};

export const findWeapon = async (req, res) => {
    const { id } = req.params;
    const weapon = await Weapon.findByPk(id);
    if (!weapon){
        res.status(404).send({ message: "Arma no encontrada" })
    }
    res.json(weapon);
}