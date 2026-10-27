import { Router } from 'express';

const router = Router();

router.get("/operatives", (req, res) => {res.send("Obteniendo operativos")});
router.post("/operatives", (req, res) => {res.send("Creando opeartivo")});
router.get("/operatives/:id", (req, res) => {
    const { id } = req.params;
    res.send(`Obteniendo operativo ${id}`)
});
router.put("/operatives/:id", (req, res) => {
    const { id } = req.params;
    res.send(`Actualizando operativo ${id}`)
});
router.delete("/operatives/:id", (req, res) => {
    const { id } = req.params;
    res.send(`Eliminando operativo ${id}`)
});


router.get("/weapons", (req, res) => {res.send("Obteniendo armas")});
router.post("/weapons", (req, res) => {res.send("Creando arma")});
router.get("/weapons/:id", (req, res) => {
    const { id } = req.params;
    res.send(`Obteniendo arma ${id}`)
});
router.put("/weapons/:id", (req, res) => {
    const { id } = req.params;
    res.send(`Actulaizando arma ${id}`)
});
router.delete("/weapons/:id", (req, res) => {
    const { id } = req.params;
    res.send(`Eliminando arma ${id}`)
});

router.get("/matchs", (req, res) => {res.send("Obteniendo partidas")});
router.post("/matchs", (req, res) => {res.send("Creando partida")});
router.get("/matchs/:id", (req, res) => {
    const { id } = req.params;
    res.send(`Obteniendo partida ${id}`)
});
router.put("/matchs/:id", (req, res) => {
    const { id } = req.params;
    res.send(`Actualizando partida ${id}`)
});
router.delete("/matchs/:id", (req, res) => {
    const { id } = req.params;
    res.send(`Eliminando partida ${id}`)
});

router.get("/weapon-rules", (req, res) => {res.send("Obteniendo efectos de armas")});
router.post("/weapon-rules", (req, res) => {res.send("Creando efecto de armas")});
router.get("/weapon-rules/:id", (req, res) => {
    const { id } = req.params;
    res.send(`Obteniendo efecto ${id} de armas`)
});
router.put("/weapon-rules/:id", (req, res) => {
    const { id } = req.params;
    res.send(`Actualizando efecto ${id} de armas`)
});
router.delete("/weapon-rules/:id", (req, res) => {
    const { id } = req.params;
    res.send(`Eliminando efecto ${id} de armas`)
});


router.get("/abilities", (req, res) => {res.send("Obteniendo habilidades")});
router.post("/abilities", (req, res) => {res.send("Creando habilidad")});
router.get("/abilities/:id", (req, res) => {
    const { id } = req.params;
    res.send(`Obteniendo habilidad ${id}`)
});
router.put("/abilities/:id", (req, res) => {
    const { id } = req.params;
    res.send(`Obteniendo habilidad ${id}`)
});

export default router;