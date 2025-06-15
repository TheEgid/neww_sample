import React, { useEffect, useState } from "react";
import { Button, Paper, Container, Space } from "@mantine/core";
import { useUnit } from "effector-react";
import Head from "next/head";
import { ToastContainer } from "react-toastify";
import ChBxes from "./ElementsOthers";
import ExpandableDiv from "@/components/ExpandableDiv";
import DtatExample from "@/components/ModalContent";
import NewElement from "@/components/Sub";
import { getCounterVisitorActionFx } from "@/model/counter-visitor/state";
import { $currentPetitionStore, checkPetitionFieldFx } from "@/model/some/current-petition-state";

const Home: React.FC = () => {
    // const { loading, error } = useUnit($addBlogItemStatus);
    const { checkedFields: computedFieldChecker } = useUnit($currentPetitionStore);

    const [isMounted, setIsMounted] = useState(false);

    useEffect(() => {
        setIsMounted(true);
    }, []);

    useEffect(() => {
        if (!isMounted) { return; }
        void getCounterVisitorActionFx({ page: 1, limit: 1 });
    }, [isMounted]);

    return (
        <>
            <ToastContainer />
            <Head>
                <title>Приложение</title>
                <link rel="icon" href="/favicon.ico" />
            </Head>
            <Container>
                <Paper>
                    <div>{computedFieldChecker}</div>
                    <div style={{ display: "flex" }}>
                        <ChBxes />
                    </div>
                    <Button variant="success" onClick={() => checkPetitionFieldFx()}>
                        Click Me!
                    </Button>
                    <Space h="xl" />
                    <NewElement />
                    <ExpandableDiv />
                    <div className="hello">
                        <DtatExample />
                    </div>
                </Paper>
            </Container>
        </>
    );
};

export default Home;

// https://habr.com/ru/articles/873112/
