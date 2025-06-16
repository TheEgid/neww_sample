
import React, { useState } from "react";
import { Button, Loader, Space, Stack, Text } from "@mantine/core";
import { useUnit } from "effector-react";
import { $counterVisitorIsLoading, $counterVisitors } from "@/model/counter-visitor/state";

const DtatExample = (): React.JSX.Element => {
    const isPending = useUnit($counterVisitorIsLoading);
    const visitors = useUnit($counterVisitors);
    const [opened, setOpened] = useState(false);

    return (
        <>
            <Space h="xl" />
            <Stack w={400} align="center">
                {isPending && <Text>Данные закрыты</Text>}
                <Text size="xl">
                    {!isPending && opened
                        ? <Stack w={300}>{visitors?.at(0)?.name ?? "Нет данных"}</Stack>
                        : <Loader type="bars" />}
                </Text>
            </Stack>
            <Button m="lg" onClick={() => setOpened((prev) => !prev)}>
                Выгрузить
            </Button>
        </>
    );
};

export default DtatExample;
