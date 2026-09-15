"use client"
import React from "react";
import { Button, Paper, Text, Title, Box, Stack } from '@mantine/core';
import { useMediaQuery } from '@mantine/hooks';
import Apple from "@/components/global/Apple";
import Logo from "@/components/logo/Logo";
import { useRouter } from "next/navigation";
import { GoogleLogin } from "@react-oauth/google";
import { authApi } from "@/lib/api/backend";
import { ApiError } from "@/lib/api/client";

export default function Login() {
  const router = useRouter();
  const [error, setError] = React.useState("");
  const [provider, setProvider] = React.useState<"google" | "apple" | null>(null);

  const signInWithGoogleCredential = async (credential?: string) => {
    if (!credential) {
      setError("Google did not return a valid credential");
      return;
    }
    setError("");
    setProvider("google");
    try {
      const res = await authApi.google({ idToken: credential });
      localStorage.setItem("accessToken", res.accessToken);
      localStorage.setItem("refreshToken", res.refreshToken);
      localStorage.setItem("isAdmin", "false");
      router.replace("/dashboard/overview");
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Google sign-in failed. Please try again.");
      setProvider(null);
    }
  };

  const signInWithAppleProvider = () => {
    setError("Apple sign-in isn't available yet — please use Google for now.");
  };

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
            backdropFilter: 'blur(12px)',
            transform: isLg ? 'translateX(-280px)' : 'translateX(0)',
          }}
        >
          <Stack align="center" justify="center" gap={0}>
            <Logo />

            <Stack gap={15} mt={isMd ? 60 : 60} align="center">
              <Title order={2} fz={isMd ? 67 : 46} fw={800} lh="100%" ta="center">
                Login
              </Title>
              <Text ta="center" size="16px" >
                Sign up and login made easy, with one click our authentication system grants you access instantly
              </Text>
            </Stack>

            <Stack w="100%" gap={10} mt={isMd ? 70 : 32}>
              {process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID ? (
                <Box style={{ opacity: provider === "google" ? 0.6 : 1, pointerEvents: provider === "google" ? "none" : "auto" }}>
                  <GoogleLogin
                    onSuccess={(response) => void signInWithGoogleCredential(response.credential)}
                    onError={() => setError("Google sign-in was cancelled or could not be completed")}
                    text="continue_with"
                    theme="outline"
                    shape="pill"
                    size="large"
                    width="100%"
                  />
                </Box>
              ) : (
                <Text c="red" size="sm" ta="center">Google sign-in is not configured</Text>
              )}

              <Button
                onClick={signInWithAppleProvider}
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