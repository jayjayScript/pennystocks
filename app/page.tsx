"use client"
import React from "react";
import { Button, Paper, Text, Title, Box, Stack } from '@mantine/core';
import { useMediaQuery } from '@mantine/hooks';
import Apple from "@/components/global/Apple";
import Google from "@/components/global/Google";
import Logo from "@/components/logo/Logo";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";

export default function Login() {
  const { signInWithGoogle, signInWithApple } = useAuth();
  const router = useRouter();
  const [error, setError] = React.useState("");
  const [provider, setProvider] = React.useState<"google" | "apple" | null>(null);
  const signIn = async (kind: "google" | "apple") => { setError(""); setProvider(kind); try { await (kind === "google" ? signInWithGoogle() : signInWithApple()); router.replace("/dashboard/overview"); } catch (err) { setError(err instanceof Error ? err.message : "Sign-in failed"); } finally { setProvider(null); } };
  const isMd = useMediaQuery('(min-width: 768px)');
  const isLg = useMediaQuery('(min-width: 1024px)');

  return (
    <Box h="100vh" w="100%" >
      <Box
        h="100vh"
        w="100%"
        style={{
          backgroundImage: `url('${isMd ? '/desktopBg.png' : '/bg.png'}')`,
          backgroundRepeat: 'no-repeat',
          backgroundPosition: 'right',
          backgroundSize: isMd ? '1000px' : '390px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: 16,
        }}
      >
        <Paper
          radius={20}
          pt={isMd ? 50 : 40}
          pr={40}
          pb={80}
          pl={40}
          w="100%"
          maw={520}
          h={isMd ? '90vh' : 'auto'}
          style={{
            background: isMd
              ? 'linear-gradient(to top left, #FFFFFF66, #FFFFFF00)'
              : 'linear-gradient(to bottom right, #FFFFFF66, #FFFFFF00)',
            // border: '1px solid #FFFFFF4C',
            backdropFilter: 'blur(12px)',
            transform: isLg ? 'translateX(-280px)' : 'translateX(0)',
          }}
        >
          <Stack align="center" justify="center" gap={0}>
            <Logo />

            <Stack gap={15} mt={isMd ? 60 : 60} align="center">
              <Title
                order={2}
                fz={isMd ? 67 : 46}
                fw={800}
                lh="100%"
                ta="center"
              >
                Login
              </Title>
              <Text ta="center" size="16px" >
                Sign up and login made easy, with one click our authentication system grants you access instantly
              </Text>
            </Stack>

            <Stack w="100%" gap={10} mt={isMd ? 70 : 32}>
              <Button
                onClick={() => signIn("google")}
                loading={provider === "google"}
                fullWidth
                leftSection={<Google />}
                bg="white"
                c="black"
                radius={54.81}
                py={15.96}
                px={17.54}
                h="auto"
                styles={{ inner: { fontWeight: 400 } }}
              >
                Continue with Google
              </Button>

              <Button
                onClick={() => signIn("apple")}
                loading={provider === "apple"}
                fullWidth
                leftSection={<Apple />}
                bg="black"
                c="white"
                radius={54.81}
                py={15.96}
                px={17.54}
                h="auto"
                styles={{ inner: { fontWeight: 400 } }}
              >
                Continue with Apple
              </Button>
              {error && <Text c="red" size="sm" ta="center">{error}</Text>}
            </Stack>
          </Stack>
        </Paper>
      </Box>
    </Box>
  );
}
