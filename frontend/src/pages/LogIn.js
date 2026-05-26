/* eslint-disable react-hooks/exhaustive-deps */
import { Header, Button, Input } from "../components";
import { Alert, AlertIcon, AlertTitle, AlertDescription, Stack } from "@chakra-ui/react";
import { useEffect, useState } from "react";
import EcoChallengeDataService from "../services/EcoChallengeService";
import { useNavigate } from "react-router-dom";

const LogIn = ({ setUser, user }) => {
  let navigate = useNavigate();
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const onChangeName = (e) => {
    const name = e.target.value;
    setName(name);
  };
  const onChangePassword = (e) => {
    const name = e.target.value;
    setPassword(name);
  };

  const handleSubmit = () => {
    var data = { username: name, password: password };
    EcoChallengeDataService.handleLogin(data)
      .then((response) => {
        if (response.status === 200) {
          setUser({ loggedIn: true, username: response.data.username, id: response.data._id });
          navigate("/dashboard");
        } else {
          setError("Invalid Username or Password.");
        }
      })
      .catch((e) => {
        console.log(e);
        setError("Invalid Username or Password.");
      });
  };

  useEffect(() => {
    if (user.loggedIn) {
      navigate("/dashboard");
    }
  }, []);

  return (
    <>
      <Header>Log In</Header>
      <Stack direction="column" spacing={4} align="center" justifyContent={"center"}>
        {error !== "" && (
          <Alert status="error" w="xs">
            <AlertIcon />
            <AlertTitle>Error!</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        <Input label="username" onChange={onChangeName} />
        <Input label="password" onChange={onChangePassword} type={"password"} />
        <Button variant="invert" onclick={handleSubmit}>
          Submit
        </Button>
      </Stack>
    </>
  );
};

export default LogIn;
