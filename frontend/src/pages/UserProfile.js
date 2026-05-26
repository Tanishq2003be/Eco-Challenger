/* eslint-disable react-hooks/exhaustive-deps */
import { Header, Card, Text } from "../components";
import { useNavigate, useParams } from "react-router-dom";
import { useCallback, useEffect, useState } from "react";
import EcoChallengeDataService from "../services/EcoChallengeService";
import { SimpleGrid, Image, Flex, Box, Badge } from "@chakra-ui/react";

const UserProfile = ({ user, setUser }) => {
  let { user_id } = useParams();
  let navigate = useNavigate();
  const [userInfo, setUserInfo] = useState({});
  const [rank, setRank] = useState("");

  const getUser = useCallback(async () => {
    await EcoChallengeDataService.getUser().then(async (response) => {
      if (response.status === 200) {
        setUser({ loggedIn: true, username: response.data.user.name, id: response.data.user._id });
      }
    });

    await EcoChallengeDataService.getPublicUser(user_id)
      .then(async (response) => {
        if (response.status === 200) {
          setUserInfo(response.data);
          const score = response.data.total_points;
          await EcoChallengeDataService.getRank(score)
            .then((response) => {
              setRank(response.data.rank);
            })
            .catch((e) => {
              console.log(e);
            });
        } else {
          console.log("error");
        }
      })
      .catch((e) => {
        console.log(e);
        navigate("/dashboard");
      });
  }, [user, userInfo]);

  useEffect(() => {
    getUser();
  }, []);

  if (!user || !userInfo) {
    return <Header>Loading...</Header>;
  }

  return (
    <>
      <Header>{userInfo.name}'s Profile!</Header>
      <Card mx={20}>
        <Flex justify={"center"}>
          <Flex borderWidth={"thick"} borderColor="brand.100" borderRadius="full" width={100} justify="center">
            <Image borderRadius="full" boxSize="150px" h={50} m={5} src={userInfo.profile_photo} alt={`User's profile picture`} />
          </Flex>
        </Flex>
        <Text size="large">{userInfo.name}</Text>
        <Text size={"small"}>Joined since {userInfo.timestamp?.slice(0, 10)}</Text>
        <SimpleGrid columns={2} spacing={10} mt={10}>
          <Box>
            <Text size="small">Ranked</Text>
            <Text size="large">#{rank}</Text>
            <Text size="small">Worldwide</Text>
          </Box>
          <Box>
            <Text size="small">Total Points</Text>
            <Text size="large">{userInfo.total_points}</Text>
          </Box>
        </SimpleGrid>
      </Card>
      <Box mt={20} pb={10}>
        <Header>Their Teams</Header>
        {userInfo.teams?.length === 0 && (
          <Text size="small" px={"2"}>
            Join or create a team to see your standings!
          </Text>
        )}
        {userInfo.team_info?.map((team, index) => {
          if (!team?.archived) {
            return (
              <>
                <Flex p={5} w="full" alignItems="center" justifyContent="center" fontFamily={"Imprima"} color="brand.300">
                  <Box bg={"brand.100"} w="lg" rounded="lg" shadow="lg" position="relative">
                    <Flex p="6" justify={"space-between"}>
                      <Flex direction="column" align={"flex-start"}>
                        <Box d="flex" alignItems="baseline">
                          {team?.archived && (
                            <Badge rounded="full" px="2" fontSize="0.8em" colorScheme="red" variant="solid">
                              Archived
                            </Badge>
                          )}
                        </Box>
                        <Box fontSize="2xl" fontWeight="semibold" as="h4" lineHeight="tight" isTruncated>
                          {team.team_name}
                        </Box>
                      </Flex>
                    </Flex>
                  </Box>
                </Flex>
              </>
            );
          }
        })}
      </Box>
      <Box pb={20}>
        {userInfo.owns?.length > 0 && <Header>Their Owned Teams</Header>}
        {userInfo.owns?.map((team) => {
          if (!team?.archived) {
            return (
              <Flex p={5} w="full" alignItems="center" justifyContent="center" fontFamily={"Imprima"} color="brand.100">
                <Box bg={"brand.200"} w="lg" rounded="lg" shadow="lg" position="relative">
                  <Flex p="6" justify={"space-between"}>
                    <Flex direction="column" align={"flex-start"}>
                      <Box d="flex" alignItems="baseline">
                        {team?.archived && (
                          <Badge rounded="full" px="2" fontSize="0.8em" colorScheme="red" variant="solid">
                            Archived
                          </Badge>
                        )}
                      </Box>
                      <Box fontSize="2xl" fontWeight="semibold" as="h4" lineHeight="tight" isTruncated>
                        {team.team_name}
                      </Box>
                    </Flex>
                  </Flex>
                </Box>
              </Flex>
            );
          }
        })}
      </Box>
    </>
  );
};

export default UserProfile;
