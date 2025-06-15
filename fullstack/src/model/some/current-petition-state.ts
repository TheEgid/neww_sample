import { type EventCallable, createEvent, createStore, createEffect, sample } from "effector";
import type { ValueOf } from "next/dist/shared/lib/constants";

export interface IPetitionFormValues {
    petRiskIsBeda: boolean,
    petRiskIsCat: boolean,
    petRiskIsDog: boolean,
    petSecurityIsProtectionOther: boolean,
    computedField: string,
    checkedFields: string
}

export const initialPetition: IPetitionFormValues = {
    petRiskIsBeda: false,
    petRiskIsCat: false,
    petRiskIsDog: false,
    petSecurityIsProtectionOther: false,
    computedField: " ",
    checkedFields: "INITIAL",
};

export const $currentPetitionStore = createStore<IPetitionFormValues>(initialPetition, { skipVoid: false });

export const setPetitionFieldFx = createEvent<{ field: keyof IPetitionFormValues, value: ValueOf<IPetitionFormValues> }>();

const updateFieldEffectFx = createEffect<{ petitionState: IPetitionFormValues,
    // anotherState: { info: string },
    field: keyof IPetitionFormValues,
    value: ValueOf<IPetitionFormValues>
}, IPetitionFormValues
>({
    handler: ({ petitionState, field, value }) => {
        const updated = { ...petitionState, [field]: value };

        return updated;
    },
});

sample({
    clock: setPetitionFieldFx,
    source: {
        petitionState: $currentPetitionStore,
        // anotherState: $anotherStore,
    },
    fn: (source, { field, value }) => ({
        petitionState: source.petitionState,
        // anotherState: source.anotherState,
        field,
        value,
    }),
    target: updateFieldEffectFx,
});

$currentPetitionStore.on(updateFieldEffectFx.doneData, (_state, updatedPetition) => updatedPetition);

const checkFields = (fields: IPetitionFormValues): number => {
    const keys: Array<keyof IPetitionFormValues> = [
        "petRiskIsBeda",
        "petRiskIsCat",
        "petRiskIsDog",
        "petSecurityIsProtectionOther",
    ];
    const foundKey = keys.filter((key) => fields[key])?.length;

    return foundKey ?? 0;
};

export const checkPetitionFieldFx: EventCallable<void> = createEvent();

const checkPetitionEffectFx = createEffect<{ petitionState: IPetitionFormValues }, IPetitionFormValues>({
    handler: ({ petitionState }) => {
        const updated = { ...petitionState };

        updated.computedField = checkFields(updated).toString();
        return updated;
    },
});

sample({
    clock: checkPetitionFieldFx,
    source: {
        petitionState: $currentPetitionStore,
    },
    fn: (source) => ({
        petitionState: source.petitionState,
    }),
    target: checkPetitionEffectFx,
});

$currentPetitionStore.on(checkPetitionEffectFx.doneData, (_state, updatedPetition) => updatedPetition);

// $currentPetitionStore.watch((el) => {
//     console.log(el);
// });
