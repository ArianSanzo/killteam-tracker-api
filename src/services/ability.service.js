import { Ability } from "../models/Ability";

export const createAbility = async (req, res) => {
    const { name, description } = req.body;
    if (!name || !description) {
        return res.status(400).send({ message: "Los campos name y description son requeridos" });
    }
    
    const newAbility = await Ability.create({
        name,
        description
    });
    res.json(newAbility); 
};

export const updateAbility = async (req, res) => {
    const { id } = req.params;

    const { name, description } = req.body;

    if (!name || !description) {
        return res.status(400).send({ message: "Los campos name y description son requeridos" });
    }

    const ability = await Ability.findByPk(id);

    if (!ability) {
        return res.status(404).send({ message: "Habilidad no encontrada"})
    }

    await ability.update({
        name,
        description
    });

    await ability.save();

    res.json(ability);
};

export const deleteAbility = async (req, res) => {
    const { id } = req.params;
    const ability = await Ability.findByPk(id);

    if (!ability) {
        return res.status(404).send({ message: "Habilidad no encontrada"})
    }

    await ability.destroy();
    
    res.send(`Eliminando habilidad ${id}`)
};

export const findAbility = async (req, res) => {
    const { id } = req.params;
    const ability = await Ability.findByPk(id);
    if (!ability) {
        return res.status(404).send({ message: "Habilidad no encontrada"})
    }
    res.json(ability);
};

export const findAbilities = async (req, res) => {
    const abilities = await Ability.findAll();
    res.json(abilities);
};