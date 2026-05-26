import TeamDAO from "../dao/team.dao.js";
import dayjs from "dayjs";
import { ObjectId } from "mongodb";

export default class TeamCtrl {
  static async apiAddTeam(req, res, next) {
  try {
    const teamOwner = ObjectId(req.body.owner);
    const teamName = req.body.name;

    const members = [teamOwner];

    const date = new Date();
    const buff = Buffer.from(date.toString());
    let teamId = buff.toString("base64").substring(0, 5);

    let teamCodeName = teamName.replace(/ /g, "-").toLowerCase().substring(0, 5);
    const teamCode = `${teamCodeName}-${teamId}`;

    // ✅ default categories (auto-selected)
    const defaultGoals = {
      "Recycling": true,
      "Energy Saving": true,
      "Water Conservation": true
    };

    // ✅ create team
    const inserted = await TeamDAO.addTeam(
      teamOwner,
      teamName,
      teamCode,
      defaultGoals,
      members
    );

    const teamID = inserted.insertedId;

    const totalGoals = await TeamDAO.getAllGoals();

    const filtered = totalGoals.filter(g => defaultGoals[g.category]);

    const week_goals = filtered.map(g =>
      g.goals[Math.floor(Math.random() * g.goals.length)]
    );

    await TeamDAO.setWeekGoals(teamID, week_goals);

    res.json({ status: "success", team_code: teamCode });
  } catch (e) {
    console.log(`error in TeamCtrl: ${e}`);
    res.status(500).json({ error: e });
  }
}


  static async apiAddWeekGoal(req, res) {
  try {
    const { team_id, goal } = req.body;

    await TeamDAO.addSingleGoal(team_id, goal);

    res.json({ status: "success" });
  } catch (e) {
    res.status(500).json({ error: e });
  }
}
  static async apiEditTeam(req, res, next) {
    try {
      const teamID = req.body.team_id;
      const goals = req.body.goals;

      const EditResponse = await TeamDAO.editTeam(teamID, goals);
      res.json({ status: "success" });
    } catch (e) {
      console.log(`error in TeamCtrl: ${e}`);
      res.status(500).json({ error: e });
    }
  }

 static async apiCreateGoals(req, res, next) {
  try {
    const teamID = req.body.team_id;
    const goals = req.body.goals;

    await TeamDAO.editTeam(teamID, goals);

    const totalGoals = await TeamDAO.getAllGoals();

    const filtered = totalGoals.filter(g => goals[g.category]);

    const week_goals = filtered.map(g =>
      g.goals[Math.floor(Math.random() * g.goals.length)]
    );

    await TeamDAO.setWeekGoals(teamID, week_goals);

    res.json({ status: "success" });
  } catch (e) {
    console.log(`error in TeamCtrl: ${e}`);
    res.status(500).json({ error: e });
  }
}
  static async apiUpdateScore(req, res, next) {
    try {
      const userID = req.body.user_id;
      const teamID = req.body.team_id;
      const teamCode = req.body.team_code;
      const score = req.body.score;

      const EditResponse = await TeamDAO.updateScore(userID, teamID, teamCode, score);
      res.json({ status: "success" });
    } catch (e) {
      console.log(`error in UserCtrl: ${e}`);
      res.status(500).json({ error: e });
    }
  }

  static async apiGetTeamById(req, res, next) {
    try {
      const teamCode = req.params.team_code || {};
      const userId = req.params.user || {};

      const getTeam = await TeamDAO.getTeamByCode(teamCode, userId);
      res.json(getTeam);
    } catch (e) {
      console.log(`error in TeamCtrl: ${e}`);
      res.status(500).json({ error: e });
    }
  }

  static async apiDeleteTeam(req, res, next) {
    try {
      const teamID = req.body.team_id;

      const deleteTeam = await TeamDAO.deleteTeam(teamID);
      res.json({ status: "success", data: deleteTeam });
    } catch (e) {
      console.log(`error in TeamCtrl: ${e}`);
      res.status(500).json({ error: e });
    }
  }
}
