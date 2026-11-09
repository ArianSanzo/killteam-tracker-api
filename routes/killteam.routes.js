import { Router } from "express";
import { login, register, currentUser, updateCurrentUser } from "../src/services/auth.service.js";
import { requireAuth, requireRole } from "../src/middleware/auth.js";
import { findUsers, findRoles, updateUserRole, deleteUser } from "../src/services/user.service.js";
import { createOperative, deleteOperative, findOperative, findOperatives, updateOperative } from "../src/services/operative.service.js";
import { createWeapon, deleteWeapon, updateWeapon, findWeapon, findWeapons } from "../src/services/weapon.service.js";
import { createMatch, updateMatch, deleteMatch, findMatch, findMatches } from "../src/services/match.service.js";
import { createRule, updateRule, deleteRule, findRule, findRules } from "../src/services/rule.service.js";
import { createAbility, updateAbility, deleteAbility, findAbilities, findAbility } from "../src/services/ability.service.js";
import { createTeam, updateTeam, deleteTeam, findTeam, findTeams } from "../src/services/team.service.js";
import { continueMatch, saveTurningPoint, updateGameOperativeWounds, updateMatchFinished } from "../src/services/game-state.service.js";

const router = Router();
const admin = requireRole("admin", "superadmin");

router.post("/auth/register", register);
router.post("/auth/login", login);
router.get("/auth/me", requireAuth, currentUser);
router.patch("/auth/me", requireAuth, updateCurrentUser);

router.get("/users", requireAuth, requireRole("superadmin"), findUsers);
router.get("/roles", requireAuth, requireRole("superadmin"), findRoles);
router.put("/users/:id/role", requireAuth, requireRole("superadmin"), updateUserRole);
router.delete("/users/:id", requireAuth, requireRole("superadmin"), deleteUser);

router.get("/team", findTeams);
router.get("/team/:id", findTeam);
router.get("/operatives", findOperatives);
router.get("/operatives/:id", findOperative);
router.get("/weapons", findWeapons);
router.get("/weapons/:id", findWeapon);
router.get("/rules", findRules);
router.get("/rules/:id", findRule);
router.get("/abilities", findAbilities);
router.get("/abilities/:id", findAbility);

router.post("/team", requireAuth, admin, createTeam);
router.put("/team/:id", requireAuth, admin, updateTeam);
router.delete("/team/:id", requireAuth, admin, deleteTeam);

router.post("/operatives", requireAuth, admin, createOperative);
router.put("/operatives/:id", requireAuth, admin, updateOperative);
router.delete("/operatives/:id", requireAuth, admin, deleteOperative);

router.post("/weapons", requireAuth, admin, createWeapon);
router.put("/weapons/:id", requireAuth, admin, updateWeapon);
router.delete("/weapons/:id", requireAuth, admin, deleteWeapon);

router.post("/rules", requireAuth, admin, createRule);
router.put("/rules/:id", requireAuth, admin, updateRule);
router.delete("/rules/:id", requireAuth, admin, deleteRule);

router.post("/abilities", requireAuth, admin, createAbility);
router.put("/abilities/:id", requireAuth, admin, updateAbility);
router.delete("/abilities/:id", requireAuth, admin, deleteAbility);

router.get("/matches", requireAuth, findMatches);
router.post("/matches", requireAuth, createMatch);
router.get("/matches/:matchId/continue", requireAuth, continueMatch);
router.put("/matches/:matchId/game-teams/:gameTeamId/turning-points/:turningPoint", requireAuth, saveTurningPoint);
router.patch("/matches/:matchId/game-teams/:gameTeamId/operatives/:gameOperativeId/wounds", requireAuth, updateGameOperativeWounds);
router.patch("/matches/:matchId/game-teams/:gameTeamId/operatives/:gameOperativeId/turning-points/:turningPoint/wounds", requireAuth, updateGameOperativeWounds);
router.patch("/matches/:matchId/finished", requireAuth, updateMatchFinished);
router.get("/matches/:id", requireAuth, findMatch);
router.put("/matches/:id", requireAuth, updateMatch);
router.delete("/matches/:id", requireAuth, deleteMatch);

export default router;
