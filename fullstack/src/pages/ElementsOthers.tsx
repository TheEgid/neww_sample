import React from "react";
import { Checkbox, Text, Space, Group, Stack } from "@mantine/core";
import { useUnit } from "effector-react";
import { $currentPetitionStore, setPetitionFieldFx, type IPetitionFormValues } from "@/model/some/current-petition-state";

const ChBxes = (): React.JSX.Element => {
    const {
        petRiskIsBeda,
        petRiskIsCat,
        petRiskIsDog,
        petSecurityIsProtectionOther,
        computedField,
    } = useUnit($currentPetitionStore);

    const handleCheckboxChange = (event: React.ChangeEvent<HTMLInputElement>): void => {
        const { name, checked } = event.target;

        setPetitionFieldFx({ field: name as keyof IPetitionFormValues, value: checked });
    };

    const checkboxes = [
        { label: "БЕДА", name: "petRiskIsBeda", checked: petRiskIsBeda },
        { label: "Кот", name: "petRiskIsCat", checked: petRiskIsCat },
        { label: "Собака", name: "petRiskIsDog", checked: petRiskIsDog },
        { label: "Прочая защита", name: "petSecurityIsProtectionOther", checked: petSecurityIsProtectionOther },
    ];

    return (
        <Stack align="flex-start" m="xl">
            <Group align="flex-start">
                {checkboxes.map((item) => (
                    <Checkbox
                        key={item.name}
                        label={item.label}
                        name={item.name}
                        width={200}
                        checked={item.checked}
                        onChange={handleCheckboxChange}
                        mb="sm"
                    />
                ))}
                <Space h="xl" />
                <Text mt="md">{`Вычисляемое поле: ${computedField}`}</Text>
                <Space h="xl" />
            </Group>
        </Stack>
    );
};

export default ChBxes;
