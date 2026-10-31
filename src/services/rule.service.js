import { Rule } from "../Rule";

export const createRule = async (req, res) => {
    const { name, description } = req.body;
    if (!name || !description){
        return res.status(400).send({ message: "Campos name y description requeridos" })
    }
    const newRule = await Rule.create({
        name,
        description
    });
    res.json(newRule);
};

export const updateRule = async (req, res) => {
    const { id } = req.params;
    const { name, description } = req.body;
    if (!name || !description){
        return res.status(400).send({ message: "Campos name y description requeridos" })
    }
    const rule = await Rule.findByPk(id);
    if(!rule){
        return res.status(404).send({ message: "Regla no encontrada" })
    }
    await rule.update({
        name,
        description
    });

    await rule.save();

    res.json(rule);
};

export const deleteRule = async (req, res) => {
    const { id } = req.params;
    const rule = await Rule.findByPk(id);
    if(!rule){
        return res.status(404).send({ message: "Regla no encontrada" })
    }
    await rule.destroy();

    res.send(`Eliminando efecto ${id} de armas`)
};

export const findRules = async (req, res) => {
    const rules = await Rule.findAll();
    res.json(rules);
};

export const findRule = async (req, res) => {
    const { id } = req.params;
    const rule = await Rule.findByPk(id);
    if(!rule){
        return res.status(404).send({ message: "Regla no encontrada" })
    }
    res.json(rule);
};