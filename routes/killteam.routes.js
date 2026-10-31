import { Router } from 'express';

import { createUser, deleteUser, findUser, findUsers, updateUser } from '../src/models/services/user.service.js';
import { createOperative, deleteOperative, findOperative, findOperatives, updateOperative } from '../src/models/services/operative.service.js';
import { createWeapon, deleteWeapon, updateWeapon, findWeapon, findWeapons } from '../src/models/services/weapon.service.js';
import { createMatch, updateMatch, deleteMatch, findMatch, findMatches } from '../src/models/services/match.service.js';
import { createRule, updateRule, deleteRule, findRule, findRules } from '../src/models/services/rule.service.js';
import { createAbility, updateAbility, deleteAbility, findAbilities, findAbility } from '../src/models/services/ability.service.js';

const router = Router();

router.get("/users", findUsers);
router.post("/users", createUser);
router.get("/users/:id", findUser);
router.put("/users/:id", updateUser);
router.delete("/users/:id", deleteUser);


router.get("/operatives", findOperatives);
router.post("/operatives", createOperative);
router.get("/operatives/:id", findOperative);
router.put("/operatives/:id", updateOperative);
router.delete("/operatives/:id", deleteOperative);

router.get("/weapons", findWeapons);
router.post("/weapons", createWeapon);
router.get("/weapons/:id", findWeapon);
router.put("/weapons/:id", updateWeapon);
router.delete("/weapons/:id", deleteWeapon);

router.get("/matchs", findMatches);
router.post("/matchs", createMatch);
router.get("/matchs/:id", findMatch);
router.put("/matchs/:id", updateMatch);
router.delete("/matchs/:id", deleteMatch);

router.get("/rules", findRules);
router.post("/rules", createRule);
router.get("/rules/:id", findRule);
router.put("/rules/:id", updateRule);
router.delete("/rules/:id", deleteRule);


router.get("/abilities", findAbilities);
router.post("/abilities", createAbility);
router.get("/abilities/:id", findAbility);
router.put("/abilities/:id", updateAbility);
router.delete("/abilities/:id", deleteAbility);

export default router;