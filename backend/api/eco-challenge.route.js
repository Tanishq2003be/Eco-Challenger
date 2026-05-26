import express from "express";
import TeamCtrl from "./team.controller.js";
import UserCtrl from "./user.controller.js";
import MemberCtrl from "./member.controller.js";

const router = express.Router();

router.route("/teams").post(TeamCtrl.apiAddTeam).put(TeamCtrl.apiEditTeam).delete(TeamCtrl.apiDeleteTeam);
router.route("/teams/our-goals").put(TeamCtrl.apiCreateGoals);
router.route("/team/add-goal").post(TeamCtrl.apiAddWeekGoal);
router.route("/team/:team_code/:user").get(TeamCtrl.apiGetTeamById);
router.route("/users/:score").get(UserCtrl.apiGetRank);
router.route("/user/:user_id").get(UserCtrl.apiGetUser);
router.route("/users/update-score").put(TeamCtrl.apiUpdateScore);
router.route("/users").put(UserCtrl.apiEditUser);
router.route("/join-team").patch(MemberCtrl.apiAddMember);
router.route("/signup").post(UserCtrl.apiAddUser);
export default router;
