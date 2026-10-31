import { User } from "../User";

export const findUsers = async (req, res) => {
    const users = await User.findAll();
    res.json(users);
};

export const findUser = async (req, res) => {
    const { id } = req.params;
    const user = await User.findByPk(id);
    if(!user){
        return res.status(404).send({ message: "Usuario no encontrado" })
    }
    res.json(user);
};

export const createUser = async (req, res) => {
    const { name, email, password, roleId } = req.body;
    if (!name || !email || !password || !roleId){
        return res.status(400).send({ message: "Campos name, email, password y roleId necesarios" })
    }
    const newUser = await User.create({
        name,
        email,
        password,
        roleId
    });
    res.json(newUser);
};

export const updateUser = async (req, res) => {
    const { id } = req.params;
    const { name, email, password, roleId } = req.body;
    if (!name || !email || !password || !roleId){
        return res.status(400).send({ message: "Campos name, email, password y roleId necesarios" })
    }
    const user = await User.findByPk(id);
    if(!user){
        return res.status(404).send({ message: "Usuario no encontrado" })
    }
    await user.update({
        name,
        email,
        password,
        roleId
    });

    await user.save();

    res.json(user);
};

export const deleteUser = async (req, res) => {
    const { id } = req.params;

    const user = await User.findByPk(id);
    if(!user){
        return res.status(404).send({ message: "Usuario no encontrado" })
    }
    await user.destroy();

    res.send(`Eliminando usuario ${id}`)
};