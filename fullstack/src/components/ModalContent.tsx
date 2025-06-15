import React, { useState } from "react";
import { Button, Group, Loader, Space, Text, Title } from "@mantine/core";
import { useUnit } from "effector-react";
import { $counterVisitorIsLoading, $counterVisitors } from "@/model/counter-visitor/state";

const DtatExample = (): React.JSX.Element => {
    const isPending = useUnit($counterVisitorIsLoading);
    const visitors = useUnit($counterVisitors);

    const [opened, setOpened] = useState(false);

    return (
        <>
            <Space h="xl" />
            <Group m="lg">
                {isPending
                    ? <Text>Данные закрыты</Text>
                    : opened
                        ? (
                            <Title>
                                <Text size="xl">
                                    {visitors?.at(0)?.namemame ?? "Нет данных"}
                                </Text>
                            </Title>
                        )
                        : <Loader type="bars" />}
            </Group>
            <Button m="lg" onClick={() => setOpened((prev) => !prev)}>Выгрузить</Button>
        </>
    );
};

export default DtatExample;
