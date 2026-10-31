import { Match } from "../Match";

export const createMatch = async (req, res) => {
    const { name, date, userId } = req.body;
    if (!name || !date || !userId) {
        return res.status(400).send({ message: "Los campos name, date y userId son requeridos" });
    }
    const newMatch = await Match.create({
        name,
        date,
        userId
    });
    res.json(newMatch);
};

export const updateMatch = async (req, res) => {
    const { id } = req.params;
    const { name, date, userId } = req.body;
    if (!name || !date || !userId) {
        return res.status(400).send({ message: "Los campos name, date y userId son requeridos" });
    }

    const match = await Match.findByPk(id);

    if (!match) {
        return res.status(404).send({ message: "Partida no encontrada"})
    }

    await match.update({
        name,
        date,
        userId
    });

    await match.save();

    res.json(match);
};

export const deleteMatch = async (req, res) => {
    const { id } = req.params;

    const match = await Match.findByPk(id);

    if (!match) {
        return res.status(404).send({ message: "Partida no encontrada"})
    }

    await match.destroy();

    res.send(`Eliminando partida ${id}`)
};

export const findMatches = async (req, res) => {
    const matchs = await Match.findAll();
    res.json(matchs);
};

export const findMatch = async (req, res) => {
    const { id } = req.params;
    const match = await Match.findByPk(id);
    if (!match) {
        return res.status(404).send({ message: "Partida no encontrada"})
    }
    res.json(match);
};