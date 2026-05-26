/* eslint-disable react-hooks/exhaustive-deps */
import { Header, Card, Text, Button } from "../components";
import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState, useCallback } from "react";
import EcoChallengeDataService from "../services/EcoChallengeService";
import {
  useDisclosure,
  Switch,
  SimpleGrid,
  Box,
  Flex,
  Avatar,
  Checkbox,
  AlertDialog,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogContent,
  AlertDialogOverlay,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
} from "@chakra-ui/react";
import {
  Drawer,
  DrawerBody,
  DrawerFooter,
  DrawerHeader,
  DrawerOverlay,
  DrawerContent,
  DrawerCloseButton,
} from "@chakra-ui/react";

const Team = ({ user, setUser }) => {
  let { team_code } = useParams();
  let navigate = useNavigate();
  const [team, setTeam] = useState();
  const [newGoal, setNewGoal] = useState("");
  const { isOpen, onOpen, onClose } = useDisclosure();
  const drawer = useDisclosure();

  const getTeam = useCallback(async () => {
    await EcoChallengeDataService.getUser()
      .then(async (response) => {
        if (response.status === 200) {
          setUser({
            loggedIn: true,
            username: response.data.user.name,
            id: response.data.user._id,
          });
          await EcoChallengeDataService.getTeam(
            team_code,
            response.data.user._id,
          )
            .then(async (response) => {
              setTeam(response.data);
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
  }, [user]);
  const handleAddGoal = async () => {
    if (!newGoal.trim()) return;

    await EcoChallengeDataService.addGoal({
      team_id: team._id,
      goal: newGoal,
    });

    window.location.reload();
  };
  const handleDelete = async () => {
    const data = { data: { team_id: team._id } };
    await EcoChallengeDataService.deleteTeam(data)
      .then((response) => {
        if (response.status === 200) {
          navigate("/dashboard");
        }
      })
      .catch((e) => {
        console.log(e);
      });
    onClose();
  };

  const handleEditGoals = async () => {
    const goalState = {};
    team.total_goals?.map((goal) => {
      const g = document.getElementById(goal._id);
      goalState[goal.category] = g.checked;
    });
    await EcoChallengeDataService.editTeamGoals({
      team_id: team._id,
      goals: goalState,
    }).then((response) => {
      if (response.status === 200) {
        window.location.reload();
      }
    });

    drawer.onClose();
  };

  const handleCreateGoals = async () => {
    await EcoChallengeDataService.thisWeek({
      team_id: team._id,
      goals: team.goals,
    }).then((response) => {
      if (response.status === 200) {
        window.location.reload();
      }
    });
  };

  const handleUserProgress = async () => {
    console.log("submitted");
    let score = 0;
    team.week_goals?.map((goal, index) => {
      const g = document.getElementById(`task-${index}`);
      score += g.checked ? 10 : 0;
    });
    await EcoChallengeDataService.thisWeekScores({
      team_id: team._id,
      team_code: team.team_code,
      user_id: user.id,
      score: score,
    }).then((response) => {
      if (response.status === 200) {
        window.location.reload();
      }
    });
  };

  useEffect(() => {
    getTeam();
  }, []);

  if (!team) {
    return <Header>Loading</Header>;
  }
  return (
    <>
      <Header>{team.team_name}</Header>
      {team.archived && (
        <Flex align={"center"} direction={"column"} pb="4">
          <Alert status="error" w="xl">
            <AlertIcon />
            <AlertTitle>Note</AlertTitle>
            <AlertDescription>
              This team has been archived and is no longer active.
            </AlertDescription>
          </Alert>
        </Flex>
      )}
      {console.log(team)}
      <SimpleGrid columns={2} spacing={10} px={20} minChildWidth="300px">
        <Card>
          <Text size="large">Standings</Text>
          <Flex align={"center"} direction={"column"}>
            {team.members?.length === 0 && (
              <Text size="small">No members have joined!</Text>
            )}
            {team.members?.map((member, index) => {
              return (
                <Box
                  bg={"brand.200"}
                  w="80%"
                  rounded="lg"
                  shadow="sm"
                  py={2}
                  my={3}
                  position="relative"
                  cursor={"pointer"}
                  onClick={() => navigate(`/user-profile/${member._id}`)}
                >
                  <Flex justify={"space-between"} align={"center"} mx={5}>
                    <Avatar bg="brand.200" mr={10} src={member.profile_photo} />
                    <Flex align={"flex-end"} direction={"column"}>
                      <Text>
                        {index + 1}. {member.name}
                      </Text>
                      <Text fontWeight={"extrabold"} size={"small"}>
                        {member.score} pts
                      </Text>
                    </Flex>
                  </Flex>
                </Box>
              );
            })}
          </Flex>
        </Card>
        <Card backgroundColor={"brand.100"}>
          <Text size="large" color={"brand.300"}>
            Team Goals
          </Text>
          {(!team.goals || !Object.values(team.goals).some((v) => v)) && (
            <Text size="small" color={"brand.300"}>
              There are no goals this week!
            </Text>
          )}
          <Flex justify={"center"}>
            <Box w={"50%"}>
              <Flex justify={"center"} align={"center"} direction={"column"}>
                <Flex
                  justify={"center"}
                  align={"flex-start"}
                  direction={"column"}
                >
                  {team.week_goals?.map((goal, index) => {
                    return (
                      <Checkbox
                        id={`task-${index}`}
                        colorScheme={"brand"}
                        size="lg"
                        color={"brand.300"}
                        fontFamily={"Imprima"}
                        my={"1"}
                        borderColor={"Background.100"}
                        textAlign={"left"}
                      >
                        {goal}
                      </Checkbox>
                    );
                  })}
                </Flex>
                {team.week_goals?.length > 0 &&
                  !team.completed.includes(user.id) && (
                    <Button mt="5" onClick={handleUserProgress}>
                      Save Progress
                    </Button>
                  )}
                {team.owner && !team.archived && (
                  <Flex mt="4" gap={2} w="100%">
                    <input
                      value={newGoal}
                      onChange={(e) => setNewGoal(e.target.value)}
                      placeholder="Add custom goal"
                      style={{
                        padding: "8px",
                        borderRadius: "8px",
                        width: "100%",
                      }}
                    />

                    <Button onClick={handleAddGoal}>Add Goal</Button>
                  </Flex>
                )}
                {team.completed?.includes(user.id) && (
                  <Button mt="5" isDisabled={true}>
                    Tasks Submitted this Week!
                  </Button>
                )}
              </Flex>
            </Box>
          </Flex>
        </Card>
      </SimpleGrid>
      <Box pt={20} pb={30}>
        <Header>Invite Members</Header>
        <Text size="large">
          Your team code is{" "}
          <Text size="large" fontWeight={"bold"}>
            {team.team_code}
          </Text>
        </Text>
      </Box>

      {team.owner && !team?.archived && (
        <Box pb={60}>
          <Header>Team Settings </Header>
          <Text fontStyle={"italic"} size="small">
            (only for owner)
          </Text>
          <Text mt="10" size="large">
            Goals
          </Text>
          {team.goals?.length === 0 && (
            <Text size="small" mb="5">
              No goal sets have been selected
            </Text>
          )}
          <Flex justify={"center"}>
            <Button variant="invert" onClick={drawer.onOpen} mr={5}>
              Edit Goals
            </Button>
            <Button variant="invert" onClick={handleCreateGoals}>
              Generate and Reset Goals
            </Button>
          </Flex>
          <Text mt="10" size="large">
            Danger!
          </Text>
          <Button variant="danger" onClick={onOpen}>
            Archive Team
          </Button>
        </Box>
      )}

      <Drawer isOpen={drawer.isOpen} placement="right" onClose={drawer.onClose}>
        <DrawerOverlay />
        <DrawerContent backgroundColor={"brand.300"}>
          <DrawerCloseButton />
          <DrawerHeader>
            <Header size="md">
              Which goals do you want to use for your team?
            </Header>
          </DrawerHeader>

          <DrawerBody>
            {team.total_goals?.map((goal) => {
              return (
                <Flex justify={"flex-start"} alignItems={"center"}>
                  <Switch
                    id={goal._id}
                    colorScheme={"brand"}
                    defaultChecked={team.goals[goal.category]}
                  />
                  <Text ml={"4"} size={"small"}>
                    {goal.category}
                  </Text>
                </Flex>
              );
            })}
          </DrawerBody>

          <DrawerFooter>
            <Button mr={3} onClick={drawer.onClose}>
              Cancel
            </Button>
            <Button variant="invert" onClick={handleEditGoals}>
              Save
            </Button>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>

      <AlertDialog isOpen={isOpen} onClose={onClose}>
        <AlertDialogOverlay>
          <AlertDialogContent
            backgroundColor={"brand.300"}
            borderColor="brand.100"
            borderWidth={4}
          >
            <AlertDialogHeader
              fontSize="lg"
              fontWeight="bold"
              fontFamily={"Imprima"}
              color={"brand.100"}
            >
              Archive Team
            </AlertDialogHeader>

            <Text size={"small"} px={6}>
              Are you sure? You can't undo this action afterwards.
            </Text>

            <AlertDialogFooter>
              <Button onClick={onClose}>Cancel</Button>
              <Button variant="danger" onClick={handleDelete} ml={3}>
                Archive
              </Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialogOverlay>
      </AlertDialog>
    </>
  );
};

export default Team;
