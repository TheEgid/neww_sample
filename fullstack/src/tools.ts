import type { ITreeNode } from "@/components/Sub";

export const listToTree = (arr: { parentsList: string[] }[]): ITreeNode[] => {
    const rootNodes: ITreeNode[] = [];
    const nodeMap = new Map<string, ITreeNode>();

    arr.forEach((item) => {
        const parentList = item.parentsList;
        let parentNode: ITreeNode | undefined;

        parentList.forEach((_, index) => {
            const nodeValue = parentList.slice(0, index + 1).join("|||");
            const nodeLabel = parentList[index];

            if (nodeMap.has(nodeValue)) {
                parentNode = nodeMap.get(nodeValue);
            }
            else {
                const newNode: ITreeNode = { value: nodeValue, label: nodeLabel };

                if (parentNode) {
                    parentNode.children = parentNode.children || [];
                    parentNode.children.push(newNode);
                }
                else {
                    rootNodes.push(newNode);
                }

                nodeMap.set(nodeValue, newNode);
                parentNode = newNode;
            }
        });
    });

    return rootNodes;
};
