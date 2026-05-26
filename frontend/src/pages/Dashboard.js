/* eslint-disable react-hooks/exhaustive-deps */
import { Header, Card, Text } from "../components";
import { useNavigate } from "react-router-dom";
import { useCallback, useEffect, useState } from "react";
import EcoChallengeDataService from "../services/EcoChallengeService";
import Intro from "./Intro";
import { SimpleGrid, Image, Flex, Box, Badge, Checkbox } from "@chakra-ui/react";
import { ArrowRightIcon } from "@chakra-ui/icons";

const Dashboard = ({ user, setUser }) => {
  let navigate = useNavigate();
  const [userInfo, setUserInfo] = useState({});
  const [rank, setRank] = useState("");
  const [pfp, setPfp] = useState(0);

  const getUser = useCallback(async () => {
    await EcoChallengeDataService.getUser()
      .then(async (response) => {
        if (response.status === 200) {
          setUser({ loggedIn: true, username: response.data.user.name, id: response.data.user._id });
          setUserInfo(response.data.user);
          const score = response.data.user.total_points;
          await EcoChallengeDataService.getRank(score)
            .then((response) => {
              setRank(response.data.rank);
            })
            .catch((e) => {
              console.log(e);
            });
        } else {
          setUser({ loggedIn: false, username: "", id: "" });
          navigate("/log-in");
        }
      })
      .catch((e) => {
        console.log(e);
        setUser({ loggedIn: false, username: "", id: "" });
        navigate("/log-in");
      });
  }, [user, userInfo]);

  useEffect(() => {
    getUser();
  }, []);

  if (!user || !userInfo) {
    return <Header>Loading...</Header>;
  }

  if (userInfo.profile_photo === "") {
    return <Intro info={userInfo} setPfp={setPfp} pfp={pfp} />;
  }

  return (
    <>
      <Header>{user.username}'s Dashboard!</Header>
      <SimpleGrid columns={2} spacing={10} px={20}>
        <Card>
          <Flex justify={"center"}>
            <Flex borderWidth={"thick"} borderColor="brand.100" borderRadius="full" width={100} justify="center">
              <Image borderRadius="full" boxSize="150px" h={50} m={5} src={userInfo.profile_photo} alt={`Your profile picture`} />
            </Flex>
          </Flex>
          <Text size="large">{user.username}</Text>
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
        <Card>
          <Text size="large">Today's Goals</Text>
          <Text fontSize="xsmall">To check off goals, visit your Teams!</Text>
          {userInfo.teams?.length === 0 && (
            <Text size="small" px={"2"}>
              Join or create a team to see your goals!
            </Text>
          )}
          <Flex justify="center">
            <Box maxW={"75%"} textAlign="left">
              {userInfo.team_info?.map((team) => {
                return (
                  <>
                    {team.week_goals?.map((goal) => {
                      return (
                        <Checkbox isChecked={true} colorScheme={"brand"} size="lg" color={"brand.100"} fontFamily={"Imprima"} my={"1"} borderColor={"Background.100"} textAlign={"left"} width={"100%"}>
                          {goal}
                          <br />
                          <Badge rounded="full" px="2" fontSize="0.8em" colorScheme="brand" variant="solid">
                            {team.team_name}
                          </Badge>
                        </Checkbox>
                      );
                    })}
                  </>
                );
              })}
            </Box>
          </Flex>
        </Card>
      </SimpleGrid>
      <Box mt={20} pb={10}>
        <Header>My Standings</Header>
        {userInfo.teams?.length === 0 && (
          <Text size="small" px={"2"}>
            Join or create a team to see your standings!
          </Text>
        )}
        {userInfo.team_info?.map((team, index) => {
          return (
            <>
              <Flex p={5} w="full" alignItems="center" justifyContent="center" onClick={() => navigate(`/teams/${team.team_code}`)} cursor="pointer" fontFamily={"Imprima"} color="brand.300">
                <Box bg={"brand.100"} w="lg" rounded="lg" shadow="lg" position="relative">
                  <Flex p="6" justify={"space-between"}>
                    <Flex direction="column" align={"flex-start"}>
                      <Box d="flex" alignItems="baseline">
                        <Badge rounded="full" px="2" fontSize="0.8em" colorScheme="brand" variant="solid">
                          Rank #{team?.scores[0]?.rank}
                        </Badge>
                        {team?.archived && (
                          <Badge rounded="full" px="2" mx="2" fontSize="0.8em" colorScheme="red" variant="solid">
                            Archived
                          </Badge>
                        )}
                      </Box>
                      <Box fontSize="2xl" fontWeight="semibold" as="h4" lineHeight="tight" isTruncated>
                        {team.team_name}
                      </Box>
                    </Flex>
                    <Flex mt="1" justifyContent="space-between" alignContent="center">
                      <ArrowRightIcon h={7} w={7} alignSelf={"center"} />
                    </Flex>
                  </Flex>
                </Box>
              </Flex>
            </>
          );
        })}
      </Box>
      <Box pb={20}>
        {userInfo.owns?.length > 0 && <Header>My Teams</Header>}
        {userInfo.owns?.map((team) => {
          return (
            <Flex p={5} w="full" alignItems="center" justifyContent="center" onClick={() => navigate(`/teams/${team.team_code}`)} cursor="pointer" fontFamily={"Imprima"} color="brand.100">
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
                  <Flex mt="1" justifyContent="space-between" alignContent="center">
                    <ArrowRightIcon h={7} w={7} alignSelf={"center"} />
                  </Flex>
                </Flex>
              </Box>
            </Flex>
          );
        })}
      </Box>
    </>
  );
};

export default Dashboard;
