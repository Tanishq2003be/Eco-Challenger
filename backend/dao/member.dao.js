let users, teams ,goals;
import mongodb from "mongodb";
const ObjectId = mongodb.ObjectId;

export default class MemberDAO {
  static async injectDB(conn) {
    if (users && teams) {
      return;
    }
    try {
      users = await conn.db(process.env.ECOCHALLENGE_NS).collection("users");
      teams = await conn.db(process.env.ECOCHALLENGE_NS).collection("teams");
      goals = await conn.db(process.env.ECOCHALLENGE_NS).collection("goals");
    } catch (e) {
      console.error(`Unable to establish a collection handle in memberDAO: ${e}`);
    }
  }

  static async addMember(teamID, userID) {
    try {
      await teams.updateOne({ team_code: { $eq: teamID } }, { $push: { members: ObjectId(userID) } });
      return await users.updateOne({ _id: { $eq: ObjectId(userID) } }, { $push: { teams: { team_id: teamID, score: 0 } } });
    } catch (e) {
      console.error(`Unable to add user: ${e}`);
      return { error: e };
    }
  }
}
