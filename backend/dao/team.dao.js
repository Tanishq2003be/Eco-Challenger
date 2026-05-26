let teams, users , goals;
import mongodb from "mongodb";
const ObjectId = mongodb.ObjectId;

export default class TeamDAO {
  static async injectDB(conn) {
    if (teams) {
      return;
    }
    try {
      teams = await conn.db(process.env.ECOCHALLENGE_NS).collection("teams");
      users = await conn.db(process.env.ECOCHALLENGE_NS).collection("users");
      goals = await conn.db(process.env.ECOCHALLENGE_NS).collection("goals");
    } catch (e) {
      console.error(`Unable to establish a collection handle in teamDAO: ${e}`);
    }
  }
static async getTeamByIdRaw(teamID) {
  return await teams.findOne({ _id: ObjectId(teamID) });
}
  static async addTeam(teamOwner, teamName, teamCode, goals, members) {
    try {
      const teamDoc = {
        owner: teamOwner,
        team_name: teamName,
        team_code: teamCode,
        goals: goals,
        members: members,
      };
      return await teams.insertOne(teamDoc);
    } catch (e) {
      console.error(`Unable to create team: ${e}`);
      return { error: e };
    }
  }

  static async editTeam(teamID, goals) {
    try {
      const updateResponse = await teams.updateOne({ _id: ObjectId(teamID) }, { $set: { goals: goals } });
      return updateResponse;
    } catch (e) {
      return { error: e };
    }
  }

static async addSingleGoal(teamID, goal) {
  return await teams.updateOne(
    { _id: ObjectId(teamID) },
    { $push: { week_goals: goal } }
  );
}
  static async createGoals(teamID, goals) {
    try {
      const updateResponse = await teams.updateOne({ _id: ObjectId(teamID) }, { $set: { week_goals: goals, completed: [] } });
      return updateResponse;
    } catch (e) {
      return { error: e };
    }
  }

  static async updateScore(userID, teamID, teamCode, score) {
    try {
      const updateTotal = await users.updateOne({ _id: ObjectId(userID) }, { $inc: { total_points: score } });
      const updateResponse = await teams.updateOne({ _id: ObjectId(teamID) }, { $push: { completed: userID } });
      const updateScoreResponse = await users.updateOne({ _id: ObjectId(userID) }, { $inc: { "teams.$[elem].score": score } }, { arrayFilters: [{ "elem.team_id": { $eq: teamCode } }] });

      return updateScoreResponse;
    } catch (e) {
      return { error: e };
    }
  }
static async getAllGoals() {
  return await goals.find({ team_id: "none" }).toArray();
}

static async setWeekGoals(teamID, weekGoals) {
  return await teams.updateOne(
    { _id: ObjectId(teamID) },
    { $set: { week_goals: weekGoals, completed: [] } }
  );
}
  static async getTeamByCode(teamCode, userId) {
    try {
      const pipeline = [
        {
          $lookup: {
            from: "users",
            localField: "members",
            foreignField: "_id",
            as: "members",
          },
        },
        {
          $match: {
            team_code: teamCode,
          },
        },
        {
          $lookup: {
            from: "users",
            let: {
              team_id: "$team_code",
            },
            pipeline: [
              {
                $unwind: "$teams",
              },
              {
                $match: {
                  $expr: {
                    $and: [
                      {
                        $eq: ["$teams.team_id", "$$team_id"],
                      },
                    ],
                  },
                },
              },
              {
                $set: {
                  score: "$teams.score",
                },
              },
              {
                $sort: {
                  score: -1,
                },
              },
              {
                $set: {
                  password: "XXXX",
                },
              },
            ],
            as: "members",
          },
        },
        {
          $set: {
            owner: {
              $eq: ["$owner", new ObjectId(userId)],
            },
          },
        },
        {
          $lookup: {
            from: "goals",
            pipeline: [
              {
                $match: {
                  team_id: "none",
                },
              },
            ],
            as: "total_goals",
          },
        },
      ];

      return await teams.aggregate(pipeline).next();
    } catch (e) {
      return { error: e };
    }
  }

  static async deleteTeam(teamID) {
    try {
      console.log("deleting");
      const updateResponse = await teams.updateOne({ _id: ObjectId(teamID) }, { $set: { archived: true } });
      return updateResponse;
    } catch (e) {
      return { error: e };
    }
  }
}
