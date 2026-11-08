import { Team } from "../models/Team.js";

export const createTeam = async (req, res) => {
    const { name, logo } = req.body;
        if (!name || !logo){
            return res.status(400).send({ message: "Campos name y logo requeridos" })
        }
        const newTeam = await Team.create({
            name,
            logo
        });
        res.json(newTeam);
};

export const updateTeam = async (req, res) => {
    const { id } = req.params;
    const { name, logo } = req.body;
    if (!name || !logo){
        return res.status(400).send({ message: "Campos name y logo requeridos" })
    }
    const team = await Team.findByPk(id);
    if(!team){
        return res.status(404).send({ message: "Equipo no encontrado" })
    }
    await team.update({
        name,
        logo
    });

    await team.save();

    res.json(team);
};

export const deleteTeam = async (req, res) => {
    const { id } = req.params;
    const team = await Team.findByPk(id);
    if(!team){
        return res.status(404).send({ message: "Equipo no encontrado" })
    }
    await team.destroy();

    res.send(`Eliminando equipo ${id}`)
};

export const findTeams = async (req, res) => {
    const teams = await Team.findAll();
    res.json(teams);
};

export const findTeam = async (req, res) => {
    const { id } = req.params;
    const team = await Team.findByPk(id);
    if(!team){
        return res.status(404).send({ message: "Equipo no encontrado" })
    }
    res.json(team);
};