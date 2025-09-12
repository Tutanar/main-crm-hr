"use client";

import Layout from "@/components/Layout/Layout";
import { Box, Card, CardBody, CardHeader, Heading, Text, Button, Stack } from "@chakra-ui/react";

export default function TwoFactorAuthPage() {
  return (
    <Layout>
      <Box p={6}>
        <Card bg="bg.subtle" borderColor="border">
          <CardHeader>
            <Heading size="md">Two‑Factor Authentication (2FA)</Heading>
          </CardHeader>
          <CardBody>
            <Stack gap={4}>
              <Text color="fg.muted">
                Здесь будет настройка двухфакторной аутентификации. Мы добавим шаги позже: генерация секретного ключа,
                сканирование через приложение‑аутентификатор и подтверждение кода.
              </Text>
              <Stack direction={{ base: "column", sm: "row" }} gap={3}>
                <Button variant="outline" isDisabled>Включить 2FA (скоро)</Button>
                <Button variant="outline" isDisabled>Отключить 2FA (скоро)</Button>
              </Stack>
            </Stack>
          </CardBody>
        </Card>
      </Box>
    </Layout>
  );
}