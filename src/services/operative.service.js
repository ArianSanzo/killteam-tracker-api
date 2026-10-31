import { Operative } from "../Operative";

export const findOperatives = async (req, res) => {
    const operatives = await Operative.findAll();
    res.json(operatives);
};

export const findOperative = async (req, res) => {
    const { id } = req.params;
    const operative = await Operative.findByPk(id);
    if(!operative){
        return res.status(404).send({ message: "Operativo no encontrado" });
    }
    res.json(operative);
};

export const createOperative = async (req, res) => {
    const { name, wounds, movement, apl, save, img, teamId } = req.body;
    if(!name || !wounds || !movement || !apl || !save || !img || !teamId){
        return res.status(400).send({ message: "Campos name, wounds, movement, apl, save, img y teamId requeridos" })
    }
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
};

export const updateOperative = async (req, res) => {
    const { id } = req.params;
    const { name, wounds, movement, apl, save, img, teamId } = req.body;
    if(!name || !wounds || !movement || !apl || !save || !img || !teamId){
        return res.status(400).send({ message: "Campos name, wounds, movement, apl, save, img y teamId requeridos" })
    }
    const operative = await Operative.findByPk(id);
    if(!operative){
        return res.status(404).send({ message: "Operativo no encontrado" });
    }
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

};

export const deleteOperative = async (req, res) => {
    const { id } = req.params;

    const operative = await Operative.findByPk(id);
    if(!operative){
        return res.status(404).send({ message: "Operativo no encontrado" });
    }
    await operative.destroy();

    res.send(`Eliminando operativo ${id}`)
};
