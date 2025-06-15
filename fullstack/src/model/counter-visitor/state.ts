import { createEffect, createStore, sample } from "effector";
import type { IUser } from "@/services/databaseService";
import { apiRoot } from "@/api";

export const $counterVisitors = createStore<IUser[] | undefined>(undefined, {
    skipVoid: false,
});

export const getCounterVisitorActionFx = createEffect(
    async (params: { page: number, limit: number, searchEmail?: string, searchId?: string }): Promise<IUser[]> => {
        try {
            const searchParams = new URLSearchParams({
                page: params.page.toString(),
                limit: params.limit.toString(),
            });

            if (params.searchEmail) { searchParams.set("searchEmail", params.searchEmail); }
            if (params.searchId) { searchParams.set("searchId", params.searchId); }

            const response = await apiRoot.get(`database?${searchParams.toString()}`);
            const data: IUser[] = await response.json();

            if (!data || !data.length || data.length < 1) {
                throw new Error("Invalid data");
            }

            return data;
        }
        catch (error) {
            throw new Error(`getCounterVisitorActionFx failed: ${(error as Error).message}`);
        }
    },
);

sample({
    source: getCounterVisitorActionFx.doneData,
    target: $counterVisitors,
});

export const $counterVisitorIsLoading = createStore(false, { skipVoid: false });

sample({
    clock: getCounterVisitorActionFx.pending,
    target: $counterVisitorIsLoading,
});

// persist({
//     store: $counterVisitors,
//     key: "counterVisitor",
//     fail: createEvent<Fail<Error>>(),
// });
